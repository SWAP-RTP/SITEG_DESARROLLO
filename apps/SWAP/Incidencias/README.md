# Documentación General del Proyecto - Sistema de Gestión de Incidencias Operativas RTP

# Intregrantes del proyecto:

- Marcelo Sanchez
- Alexa Grimaldo
- Gerardo Ramírez

Este documento tiene como objetivo explicar la estructura general del código fuente y las prácticas que seguimos para mantener un desarrollo ordenado, entendible y escalable para todos los integrantes del equipo.

---

## Organización del código

En la raíz del proyecto existe una carpeta llamada `includes`, donde se almacenan **funciones globales**.  
La idea principal es evitar repetir código en diferentes módulos y, en su lugar, centralizar funciones reutilizables para que puedan ser importadas desde los archivos `.js` o `.php` cuando se necesiten.

Esto permite:

- Mantener el archivo principal más ligero y legible.
- Facilitar el mantenimiento y optimización del código.
- Promover reutilización de lógica entre distintos módulos del sistema.

**Nota:** Cualquier integrante del equipo está autorizado a agregar funciones globales, siempre y cuando se documente su uso y propósito de manera clara para facilitar su implementación por otros desarrolladores.

---

## Componentes globales

Uno de los elementos clave del proyecto es la integración de componentes globales, como por ejemplo **DataTable**, que se configura una sola vez y luego puede ser consumida desde cualquier vista del sistema sin necesidad de repetir código de inicialización.

El objetivo es que el proyecto evolucione a un entorno modular donde los componentes puedan utilizarse de forma inmediata con solo llamarlos, garantizando uniformidad en el comportamiento y la interfaz.

---

## Control de versiones

El proyecto cuenta con un **repositorio activo en Git**, donde se registran los cambios realizados por día.  
Esto nos permite:

- Mantener historial de modificaciones.
- Identificar fácilmente qué integrante hizo un cambio y cuándo.
- Recuperar versiones anteriores si es necesario.
- Trabajar en equipo sin conflictos mediante ramas y commits organizados.

Repositorio de trabajo:  
`https://github.com/RmzGerardo/Proyecto-Gestion-de-Reportes-Operativos-`

- Usar con responabilidad y antes de clonarlo, pedir permiso al Jefe inmediato.

---

## Mantenimiento y mejora continua

El código se considera **vivo**, lo que significa que estará en constante revisión y optimización.  
Cada ajuste busca mejorar la claridad, reducir redundancias y mantener una arquitectura limpia que permita escalar el proyecto sin generar desorden.

Se busca aplicar progresivamente mejores prácticas como:

- Separación de responsabilidades por archivo/módulo.
- Comentarios claros solo cuando sean necesarios.
- Estandarización de nombres de funciones y variables.
- Normalizacion de las tablas del proyecto.
- Eliminación de código duplicado o sin uso.

Este documento puede actualizarse conforme el proyecto crezca o se integren nuevas reglas de trabajo o mejoras técnicas.

## Propuesta de modularizacion de carpetas y funciones

Incidencias/
├── app/ <-- Toda la lógica del servidor (PHP)
│ └── scripts/ <-- Funciones JS comunes (ej. funciones goblales)
│ └── includes / <-- Funciones PHP comunes (ej. funciones complementarias)
│
├── public/ <-- Contenido accesible desde el navegador
│ ├── assets/
│ │ ├── css/
│ │ ├── img/
│ │ └── js/
│ └── index.php <-- Punto de entrada principal
│
├── views/ <-- Plantillas HTML/PHP
│ ├── components/ <-- Encabezado, menú, pie
│ └── repositorio.html/ <-- Vistas del nuevo módulo
│ ├── formulario.html
│ └── repositorio.html
│
└── uploads/ <-- Archivos subidos
