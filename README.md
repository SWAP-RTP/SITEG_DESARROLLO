# SITEG Desarrollo – Guía de Configuración Local

Este repositorio contiene los sistemas **Login**, **TAIN** y **SWAP**.  
Sigue estos pasos para configurar tu entorno de desarrollo local **sin afectar el servidor de producción**.

Ten en cuenta que deberas tener instalado docker desktop para poder levantar este proyecto.
Ademas de tener conocimientos en Git y Github

---
## 1. Despliegue con Docker

Una vez clonado el repositorio, construye y levanta los contenedores:

```bash
docker compose up --build -d
```

---

## 2. Instalación de Dependencias (Firebase JWT)

Para que el sistema de autenticación por tokens funcione correctamente, instala la librería `firebase/php-jwt` dentro de cada contenedor.

**Comandos por módulo:**

- **Sistema de Login**

  ```bash
  docker exec -it app_login composer require firebase/php-jwt
  ```

- **Sistema TAIN**

  ```bash
  docker exec -it app_tain composer require firebase/php-jwt
  ```

- **Sistema SWAP**
  ```bash
  docker exec -it app_swap composer require firebase/php-jwt
  ```

---

## 3. Flujo de Trabajo con Git

Si necesitas enviar tus cambios a producción después de trabajar en tu rama:

# !! OJO: solo para los administradores de SITEG

1. Realiza el merge de tu rama con `main`.
2. Agrega el remoto de producción (si no está configurado).
3. Sube los cambios:

   ```bash
   git push produccion main
   ```

---

## Notas Adicionales

- **Importante:**  
  No incluyas `menu.js` o `logout.php` en el `.gitignore` si ya existen en el repositorio, ya que eso causaría que desaparezcan del servidor en el próximo despliegue.  
  El comando `git update-index --assume-unchanged` es la forma correcta de manejar esto.

## Mapa de estructuracion de SITEG !!

--- Esta sera la esctructura que se seguira para tener un mayor control en cuanto a la estructura del codigo.

SITEG/
├── Apps/
│ ├── LOGIN/
│ │ ├── admin/
│ │ │ ├── query_sql
│ │ │ └── scripts
│ │ ├── auth
│ │ ├── conf
│ │ ├── includes/
│ │ │ ├── components
│ │ │ ├── utils
│ │ │ ├── query_sql
│ │ │ └── img
│ │ ├── js
│ │ ├── login.html
│ │ ├── menu.html
│ │ ├── middleware.php
│ │ ├── nginx.conf
│ │ ├── sinteg.conf

│ │ ├── SUGO

│ │ ├── SWAP/
│ │ │ ├── config
│ │ │ ├── includes
│ │ │ ├── Nombre_modulo/
│ │ │ │ ├── components
│ │ │ │ ├── scripts
│ │ │ │ ├── query_sql
│ │ │ │ └── css
│ │ │ ├── Nombre_modulo/
│ │ │ │ ├── components
│ │ │ │ ├── scripts
│ │ │ │ ├── query_sql
│ │ │ │ └── css

│ │ │ ├── public/
│ │ │ │ └─
─ librerias_locales de css
│ │ │ ├── vendor
│ │ │ ├── composer.json
│ │ │ ├── composer.lock
│ │ │ ├── login.html
│ │ │ ├── menu.html
│ │ │ ├── middleware.php
│ │ │ └── index.html

│ │ └── Tain
│ └── README.md
├── Dockerfile
├── docker-compose.yml
└── README.md
