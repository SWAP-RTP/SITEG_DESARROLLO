# Documentación – Reestructuración del módulo de autenticación (Swap)

## Autenticación
El sistema utiliza **JWT (JSON Web Token)** para la autenticación de usuarios.
Al iniciar sesión, se genera un **token seguro** mediante una librería instalada por `vendor`, el cual se guarda como **cookie**.

La contraseña del usuario **no se almacena en texto plano**, sino que se guarda utilizando un **hash**, garantizando mayor seguridad.

## Contenido del token
Por defecto, el token JWT contiene la siguiente información del usuario:
- Nombre
- Correo electrónico

## Objetivo
El objetivo de esta implementación es:
- Identificar al usuario autenticado
- Mostrar su **nombre** dentro del menú de la aplicación
- Permitir saber qué usuario se encuentra actualmente dentro del sistema

## Extracción de datos del token
Para obtener el nombre del usuario desde el frontend:
- Se desestructura el token almacenado en la cookie
- Se utiliza una función en JavaScript ubicada en:

` js/auth_name.js`

- Esta función se encarga de leer el token y extraer el nombre del usuario para su uso en la interfaz.
-LOL


