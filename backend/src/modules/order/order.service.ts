import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetail } from 'src/entities/orderdetail.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductInfo, UpdateOrderDto } from './order.dto';
import { User } from 'src/entities/user.entity';
import { Product } from 'src/entities/products/product.entity';
import { ProductsOrder } from 'src/entities/product-order.entity';
import { OrderQuery } from './orders.query';
import { Transaccion } from 'src/entities/transaction.entity';
import { OrderStatus } from 'src/enum/orderStatus.enum';


@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(OrderDetail) private orderDetailRepository: Repository<OrderDetail>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(Transaccion) private transactionRepository: Repository<Transaccion>,
        @InjectRepository(ProductsOrder) private productsOrderRepository: Repository<ProductsOrder>,

        private readonly orderQuery: OrderQuery,
        private readonly dataSource: DataSource
    ){}

    async getOrders() {
        return await this.orderQuery.getOrders()
    }

    async getOrderById(id: string) {
        const foundOrder = await this.orderQuery.getOrderById(id);
        if(!foundOrder) throw new NotFoundException(`Orden no encontrada. ID: ${id}`);

        return foundOrder;
    }

    async getOrdersByUserId(id: string) {
        return await this.orderQuery.getOrdersByUserId(id)
    }

    async createOrder(
      userId: string, 
      productsInfo: ProductInfo[], 
      address: string | undefined, 
      discount: number | undefined, 
      deliveryDate: Date | undefined
  ) {
      let total = 0; 
      let createdOrder;
  
      const user = await this.userRepository.findOneBy({ id: userId, isDeleted: false });   
      if (!user) throw new BadRequestException(`User not found. ID: ${userId}`);
  
      // Verifica existencia de productos y stock
      await Promise.all(productsInfo.map(async (product)=> {
          const foundProduct = await this.productRepository.findOneBy({ id: product.id });
          if (!foundProduct) throw new BadRequestException(`Product not found. ID: ${product.id}`);
          if (foundProduct.stock <= 0) throw new BadRequestException(`Producto sin stock. ID: ${foundProduct.id}`);
      }));
  
      // Iniciamos transacción
      await this.dataSource.transaction(async (transactionalEntityManager) => {
          const order = transactionalEntityManager.create(Order, { user, date: new Date() });
          const newOrder = await transactionalEntityManager.save(order);
          createdOrder = newOrder;
  
          await Promise.all(productsInfo.map(async (product) => {
              // Actualizamos el stock del producto
              await this.updateStock(product.id);
  
              const foundProduct = await transactionalEntityManager.findOneBy(Product, { id: product.id });
              if (!foundProduct) throw new BadRequestException(`Product not found. ID: ${product.id}`);
              
              total += ((foundProduct.price * product.quantity) * (1 - foundProduct.discount));
              
              // Crear y guardar la relación ProductsOrder
              const productsOrder = transactionalEntityManager.create(ProductsOrder, {
                  product: foundProduct, // Corregir para asociar correctamente el producto
                  order: newOrder,
                  quantity: product.quantity
              });
  
              await transactionalEntityManager.save(ProductsOrder, productsOrder);
          }));
  
          if (discount) total *= (1 - discount);
  
          const orderDetail = transactionalEntityManager.create(OrderDetail, {
              totalPrice: Number(total.toFixed(2)),
              order: newOrder,
              discount: discount || 0,
              addressDelivery: address || 'Tienda',
              deliveryDate
          });
  
          await transactionalEntityManager.save(OrderDetail, orderDetail);
  
          // Agregamos estado
          await transactionalEntityManager.save(Transaccion, {
              status: OrderStatus.RECIBIDO,
              timestamp: new Date(),
              orderdetail: orderDetail
          });
      });
  
      return createdOrder;
  }
  
    async deleteOrder(id: string) {
      return await this.orderQuery.deleteOrder(id);
    }
    
    async updateStock(id: string) {
        const product = await this.productRepository.findOne({ where: { id } });
        await this.productRepository.update({ id },{ stock: product.stock - 1 });

        }
        async updateOrder(orderId: string, productsInfo: ProductInfo[], address: string, discount: number, deliveryDate: Date) {
            let total = 0;
        
            // Encuentra la orden existente
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: ['productsOrder', 'productsOrder.product', 'orderDetail']
            });
        
            if (!order) {
                throw new NotFoundException('Orden no encontrada');
            }
        
            // Verifica si productsInfo está definido y es un array
            if (!Array.isArray(productsInfo)) {
                throw new BadRequestException('La información de los productos no es válida');
            }
        
            // Actualiza el stock de los productos y calcula el total
            await Promise.all(productsInfo.map(async (product) => {
                const foundProduct = await this.productRepository.findOne({ where: { id: product.id } });
                if (!foundProduct) throw new BadRequestException(`Producto no encontrado. ID: ${product.id}`);
                if (foundProduct.stock < product.quantity) throw new BadRequestException(`Stock insuficiente para el producto ID: ${product.id}`);
        
                // Calcula el total para este producto
                const productTotal = (foundProduct.price * product.quantity) * (1 - (foundProduct.discount / 100));
                total += productTotal;
                
                // Actualiza o crea la relación en productsOrder
                const existingProductOrder = order.productsOrder.find(p => p.product.id === product.id);
                if (existingProductOrder) {
                    existingProductOrder.quantity = product.quantity;
                    await this.productsOrderRepository.save(existingProductOrder);
                } else {
                    const newProductOrder = this.productsOrderRepository.create({
                        product: foundProduct,
                        order,
                        quantity: product.quantity
                    });
                    await this.productsOrderRepository.save(newProductOrder);
                }
        
                // Actualiza el stock
                for (let i = 0; i < product.quantity; i++) {
                    await this.updateStock(product.id);
                }
        
                console.log(`Producto ID: ${product.id}`);
                console.log(`Precio del Producto: ${foundProduct.price}`);
                console.log(`Cantidad del Producto: ${product.quantity}`);
                console.log(`Descuento del Producto: ${foundProduct.discount}`);
                console.log(`Total Calculado para este Producto: ${productTotal}`);
            }));
        
            // Aplica el descuento general al total
            if (discount) total *= (1 - (discount / 100));
        
            // Actualiza la orden
            order.orderDetail.addressDelivery = address || order.orderDetail.addressDelivery;
            order.orderDetail.totalPrice = Number(total.toFixed(2));
            order.orderDetail.cupoDescuento = discount || order.orderDetail.cupoDescuento;
            order.orderDetail.deliveryDate = deliveryDate || order.orderDetail.deliveryDate;
        
            await this.orderDetailRepository.save(order.orderDetail);
            await this.orderRepository.save(order);
        
            // Actualiza el estado de la transacción
            const transaction = this.transactionRepository.create({
                status: OrderStatus.RECIBIDO, // Ajusta el estado según sea necesario
                timestamp: new Date(),
                orderdetail: order.orderDetail
            });
        
            await this.transactionRepository.save(transaction);
        
            return order;
        }
        
}
