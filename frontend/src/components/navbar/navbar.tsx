"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaCartPlus } from "react-icons/fa";
import { AiFillProduct, AiFillTag } from "react-icons/ai";
import { FaHome } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { MdHelp } from "react-icons/md";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import { useProductContext } from '@/context/product.context';
import { useAuthContext } from "@/context/auth.context";
import { useCartContext } from "@/context/cart.context";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [nav, setNav] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { searchResults: searchProductResults, searchProducts } = useProductContext();
  const {session, handleSignOut, authLoading} = useAuthContext();
  const { cartItemCount } = useCartContext();
  const hideNavbar = pathname === "/login" || pathname === "/register";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchProducts(term);
  };

  const handleProductClick = () => {
    setSearchTerm("");
  };

  const handleNavLinkClick = () => {
    setNav(false);
  };



  if (hideNavbar) {
    return null;
  }
  
  return (
    <header className="relative text-gray-600 body-font">
      <div className="relative z-10 container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-between">
        <div className="flex items-center text-gray-900 mb-4 md:mb-0 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center">
            <AiOutlineMenu
              onClick={() => setNav(!nav)}
              size={30}
              className="mr-2 cursor-pointer sm:hidden"
            />
            <Link href="/" className="flex items-center text-gray-900">
              <div className="w-20 h-25 text-white p-2 md:w-16 md:h-20">
                <Image
                width={500}
                height={500}
                  src="/esmeraldaLogosolo.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
          <div className="flex items-center w-full md:w-auto justify-between space-x-2 md:hidden">
            <div className="relative flex items-center w-full md:w-auto justify-between md:justify-start space-x-2">
              <input
                className="bg-gray-200 rounded-full pl-10 pr-4 py-1 focus:outline-none w-full md:w-64"
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <AiOutlineSearch size={20} className="absolute left-2 text-gray-600" />
            </div>
            <button
              onClick={() => router.push("/cart")}
              className="text-teal-700 flex items-center p-2 rounded-full relative"
            >
              <FaCartPlus size={30} />
              {cartItemCount > 0 && (
                <span className="bg-teal-800 rounded-full w-6 h-6 flex items-center justify-center text-white absolute -top-1 -right-1">
                  {cartItemCount}
                </span>
              )}
            </button>
            {!session && (
              <Link href="/login">
                <button className="text-gray-900 font-bold">Iniciar Sesion</button>
              </Link>
            )}
            {session && (
  <Dropdown
    arrowIcon={false}
    inline
    label={
      session.image ? (
        <Image
          src={session.image}
          alt="imagen"
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <Image
          src="/perfilModerno.png"
          alt="imagen por defecto"
          width={40}
          height={40}
          className="rounded-full"
        />
      )
    }
  >
    <Dropdown.Header>
      <span className="block text-sm">{session.name}</span>
      <span className="block truncate text-sm font-medium">{session.email}</span>
    </Dropdown.Header>
    {session?.role === "Administrador" ? (
      <Dropdown.Item href="/dashboard">Dashboard de Administrador
      </Dropdown.Item>
    ) : (

      <Dropdown.Item href="/dashboardCliente">Dashboard</Dropdown.Item>
    )}
    <Dropdown.Item onClick={handleSignOut}>Salir</Dropdown.Item>
  </Dropdown>
)}
          </div>
        </div>
        <nav className="hidden md:flex md:ml-auto md:mr-auto flex-wrap items-center text-base justify-center gap-5 mx-5">
          <Link href="/categories" className={` hover:text-gray-900 ${pathname === "/categories" && "text-gray-900 font-bold"}`}>
            Tienda Online
          </Link>
          {session?.role === "admin" && (
            <Link href="/dashboard/product" className={` hover:text-gray-900 ${pathname === "/dashboard/product" && "text-gray-900 font-bold"}`}>
              Admin Dashboard
            </Link>
          )}
          <Link href="/sobrenosotros" className={` hover:text-gray-900   ${pathname === "/sobrenosotros" && "text-gray-900 font-bold"}`}>
            Sobre la Esmeralda
          </Link>
          <Link href="/politica" className={` hover:text-gray-900 ${pathname === "/politica" && "text-gray-900 font-bold"}`}>
            Politica
          </Link>
          {session && <Link href="/contact" className={` hover:text-gray-900 ${pathname === "/contact" && "text-gray-900 font-bold"}`}>
            Contacto 
          </Link>}
          <Link href="/mvv" className={` hover:text-gray-900 ${pathname === "/mvv" && "text-gray-900 font-bold"}`}>
            MVV
          </Link>
          <Link href="/faq" className={` hover:text-gray-900 ${pathname === "/faq" && "text-gray-900 font-bold"}`}>
            F&Q
          </Link>
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative flex items-center w-full md:w-auto justify-between md:justify-start space-x-2">
            <input
              className="bg-gray-200 rounded-full pl-10 pr-4 py-1 focus:outline-none w-full md:w-64 "
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <AiOutlineSearch
              size={20}
              className="absolute left-2 text-gray-600"
            />
          </div>
          <button
            onClick={() => router.push("/cart")}
            className="text-teal-700 flex items-center p-2 rounded-full relative"
          >
            <FaCartPlus size={30} />
            {cartItemCount > 0 && (
              <span className="bg-red-400 rounded-full w-6 h-6 flex items-center justify-center text-white absolute -top-1 -right-1">
                {cartItemCount}
              </span>
            )}
          </button>
          {!session && (
            <Link href="/login">
              <button className="text-gray-900 font-bold">
                Iniciar Sesion
              </button>
            </Link>
          )}
          {session && (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="flex  items-center gap-2">
                {session?.image ? (
        <Image
          src={session?.image}
          alt="imagen"
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <Image
          src="/perfilModerno.png"
          alt="imagen por defecto"
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
                <p className="text-sm text-center w-20 text-wrap">{session?.name}</p>
                </div>
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{session?.name}</span>
                <span className="block truncate text-sm font-medium">
                  {session?.email}
                </span>
              </Dropdown.Header>
              {session?.role === "Administrador" ? (
                <Dropdown.Item href="/dashboard/product">Dashboard de Administrador</Dropdown.Item>
              ) : (
                <div className="flex flex-col">
                <Dropdown.Item href="/dashboardCliente">Dashboard</Dropdown.Item>
                <Dropdown.Item href="/tracking">Envios</Dropdown.Item>
                </div>
              )}
              <Dropdown.Item onClick={handleSignOut}>Salir</Dropdown.Item>
            </Dropdown>
          )
          
          }
        </div>
      </div>
      {searchProductResults !== undefined && searchProductResults.length > 0 && searchTerm && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white shadow-md">
          {searchProductResults?.map((product: any) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              onClick={handleProductClick}
            >
              <div className="flex items-center p-2 border-b border-gray-200">
                <Image
                  width={500}
                  height={500}
                  src={product.imgUrl}
                  alt={product.description}
                  className="w-12 h-12 object-cover mr-2"
                />
                <p className="text-gray-800">{product.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {nav && (
        <div
          className="bg-black/80 fixed w-full h-screen z-10 top-0 left-0"
          onClick={() => setNav(false)}
        ></div>
      )}

      <div
        className={
          nav
            ? "fixed top-0 left-0 w-[300px] h-screen bg-white z-20 duration-300"
            : "fixed top-0 left-[-100%] w-[300px] h-screen bg-white z-20 duration-300"
        }
      >
        <AiOutlineClose
          onClick={() => setNav(!nav)}
          size={30}
          className="absolute right-4 top-4 cursor-pointer dark:text-black"
        />
        <h2 className="text-2xl p-4 dark:text-black">
          La <span className="font-bold">Esmeralda Cafe</span>
        </h2>
        <nav>
          <ul className="flex flex-col p-4 text-gray-800">
          <li className="text-xl py-4 flex">
              
              <Link
                href="/"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <FaHome size={25}  />
                Inicio
              </Link>
            </li>
            {session && <li className="text-xl py-4 flex">
              <Link
                href="/tracking"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/tracking" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <TbTruckDelivery size={25}  />
                Envios
              </Link>
            </li>}
            
            <li className="text-xl py-4 flex">
              
              <Link
                href="/categories"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/categories" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <AiFillProduct size={25}/>
                Tienda Online
              </Link>
            </li>
            <li className="text-xl py-4 flex">
              
              <Link
                href="/promotions"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/promotions" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <AiFillTag size={25} />
                Promociones
              </Link>
            </li>
            <li className="text-xl py-4 flex">
              
              <Link
                href="/cart"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/cart" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <FaCartPlus size={25} />
                Carrito
              </Link>
            </li>
            <li className="text-xl py-4 flex">
              
              <Link
                href="/sobrenosotros"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/sobrenosotros" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <MdHelp size={25} />
                Sobre la Esmeralda
              </Link>
            </li>
            <li className="text-xl py-4 flex">
              
              <Link
                href="/politica"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/politica" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <AiFillProduct size={25}/>
                Politica
              </Link>
            </li>
            <li className="text-xl py-4 flex">
              
              <Link
                href="/mvv"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/mvv" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <AiFillProduct size={25}/>
                MVV
              </Link>
            </li>

            
            <li className="text-xl py-4 flex">
              
              <Link
                href="/faq"
                className={`hover:text-orange-400 gap-4 flex ${
                  pathname === "/faq" ? "text-orange-400 font-bold" : ""
                }`}
                onClick={handleNavLinkClick}
              >
                <MdHelp size={25}/>
                F&Q
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full h-40 overflow-hidden">
          <div className="relative w-full h-full">
            <div className="absolute left-0 top-0 w-20 h-20 bg-hamburger bg-contain bg-no-repeat animate-bounce"></div>
            <div className="absolute left-1/3 top-0 w-20 h-20 bg-fries bg-contain bg-no-repeat animate-bounce delay-150"></div>
            <div className="absolute left-2/3 top-0 w-20 h-20 bg-delivery bg-contain bg-no-repeat animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;