import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";


export class ProductInfo{
    @IsUUID()
    id: string;
  
    @IsInt()
    @IsNotEmpty()
    quantity: number;
}

export class AddOrderDto{
    @IsUUID()
    userId: string;

    @IsString()
    @IsNotEmpty()
    @Optional()
    address?: string;

    @IsNumber()
    @Optional()
    discount?: number;

    @Type(() => Date)
    @IsDate()
    @Optional()
    deliveryDate?: Date;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductInfo)
    products: ProductInfo[]
}

export class UpdateOrderDto {
    @IsUUID()
    @IsOptional()
    userId?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    deliveryDate?: Date;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProductInfo)
    products?: ProductInfo[];

}