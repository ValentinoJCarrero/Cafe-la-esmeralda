import { IUser } from "@/interfaces/IUser";
import { ILoginProps } from "@/types/login";
import axios from "axios";


//! Funcion para iniciar sesion
export async function LoginUser(user: ILoginProps): Promise<IUser> {
  try {
    const res = await axios.post("http://localhost:3001/users/signin", user, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 200) {
      const userData: IUser = res.data;
      console.log("Usuario autenticado:", userData);
      return userData;
    } else {
      throw new Error(`Error iniciando sesión: ${res.status} - ${res.data.message || res.statusText}`);
    }
  } catch (error: any) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango de 2xx
      throw new Error(`Error iniciando sesión: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      throw new Error("Error iniciando sesión: No se recibió respuesta del servidor.");
    } else {
      // Algo sucedió al configurar la solicitud
      throw new Error(`Error iniciando sesión: ${error.message}`);
    }
  }
}

//! Funcion para registrar usuario

export async function NewUser(user: IUser): Promise<IUser> {
    try {
        const res = await axios.post("http://localhost:3001/users/signup", user, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(res); // Captura la respuesta del servidor

        if (res.status !== 200 && res.status !== 201) {
            throw new Error(`Error registrando usuario: ${res.status} - ${res.data.message}`);
        }

        const newUser = res.data as IUser;
        console.log(newUser);

        return newUser;
    } catch (error: any) {
        if (error.response) {
            throw new Error(`Error registrando usuario: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
            throw new Error('Error registrando usuario: No se recibió respuesta del servidor.');
        } else {
            throw new Error(`Error registrando usuario: ${error.message}`);
        }
    }
}
