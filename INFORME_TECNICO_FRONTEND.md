# INFORME TÉCNICO - DESARROLLO DEL FRONTEND DEL PROYECTO PROBADOR VIRTUAL

## INTRODUCCIÓN

El presente informe describe el desarrollo e implementación del frontend del proyecto "Probador **Virtual** con IA - StyleAI", una aplicación web moderna que permite a los usuarios visualizar prendas de vestir mediante inteligencia artificial **antes** de realizar una compra. Este documento detalla los aspectos técnicos del desarrollo, la arquitectura implementada y las funcionalidades principales del sistema.

---

## 1. CONFIGURACIÓN DEL PROYECTO EN REACT CON ARQUITECTURA MODULAR

### 1.1 Fundamentos Tecnológicos del Proyecto

El desarrollo del frontend se ha basado en un stack tecnológico moderno y robusto, seleccionado cuidadosamente para garantizar escalabilidad, mantenibilidad y rendimiento óptimo. Como base fundamental, se ha utilizado React en su versión 18.3.1, una de las librerías más populares y maduras para la construcción de interfaces de usuario. Esta elección se complementa con TypeScript 5.8.3, que proporciona tipado estático al código JavaScript, permitiendo detectar errores en tiempo de desarrollo y facilitando el mantenimiento a largo plazo del proyecto.

Para el sistema de construcción y desarrollo, se ha optado por Vite 5.4.19, una herramienta de nueva generación que ofrece un servidor de desarrollo extremadamente rápido y tiempos de construcción optimizados. Esta decisión técnica mejora significativamente la experiencia de desarrollo en comparación con herramientas tradicionales como Webpack o Create React App. El manejo de rutas y navegación se gestiona mediante React Router DOM en su versión 6.30.1, que permite crear una Single Page Application (SPA) con navegación fluida y sin recargas de página.

La gestión del estado del servidor y el caché de datos se ha implementado utilizando TanStack Query 5.83.0, una solución moderna y eficiente que simplifica las llamadas a APIs y optimiza automáticamente el rendimiento mediante estrategias inteligentes de caché. Para la comunicación HTTP con el backend, se utiliza Axios 1.7.9, un cliente robusto que facilita el manejo de peticiones, interceptores y manejo de errores de manera centralizada.

En cuanto al diseño visual, se ha adoptado Tailwind CSS 3.4.17, un framework CSS utility-first que permite construir interfaces responsivas de manera rápida y consistente. Este sistema se complementa con Shadcn/UI, una colección de componentes UI basados en Radix UI que proporciona componentes accesibles y altamente personalizables. Finalmente, para la validación de formularios y esquemas de datos, se implementa Zod 4.1.11, una librería de validación declarativa que funciona perfectamente con TypeScript.

### 1.2 Arquitectura Modular y Organización del Código

La arquitectura del proyecto frontend sigue un patrón modular basado en la separación de responsabilidades, donde cada componente, módulo o servicio tiene una función específica y bien definida. Esta organización no es arbitraria, sino que responde a principios de ingeniería de software que facilitan el mantenimiento, la escalabilidad y la colaboración en equipo.

El directorio raíz del código fuente (`frontend/src/`) se organiza en múltiples subdirectorios, cada uno con un propósito específico. El directorio `assets/` contiene todos los recursos estáticos del proyecto, como imágenes y archivos multimedia. En este caso particular, almacena imágenes clave como `hero-fashion.jpg` utilizada en la página principal y `product-placeholder.jpg` que sirve como imagen de respaldo cuando una imagen de producto no puede cargarse.

El directorio `components/` constituye el corazón de la interfaz de usuario y contiene todos los componentes reutilizables de la aplicación. Aquí se encuentran componentes de nivel medio como `CategoryFilter.tsx` que implementa el sistema de filtrado por categorías, `CategoryGrid.tsx` que muestra las categorías en formato de cuadrícula, `FeatureSection.tsx` para mostrar características destacadas del servicio, y componentes estructurales como `Header.tsx` y `Footer.tsx` que proporcionan la navegación y el pie de página respectivamente. Componentes más especializados como `ProductGrid.tsx` y `ProductPreview.tsx` gestionan la visualización de productos en diferentes contextos, mientras que `SearchBar.tsx` implementa la funcionalidad de búsqueda en tiempo real.

Dentro de `components/`, existe un subdirectorio especial llamado `ui/` que contiene 49 componentes base del sistema de diseño. Estos componentes son primitivos reutilizables como botones, cards, diálogos, inputs y muchos otros elementos fundamentales que se combinan para construir interfaces más complejas. Esta separación permite mantener una consistencia visual en toda la aplicación y facilita actualizaciones globales del diseño.

El directorio `contexts/` implementa el patrón de Context API de React para gestionar el estado global de la aplicación. El contexto principal es `AuthContext.tsx`, que maneja toda la lógica relacionada con la autenticación del usuario, incluyendo inicio de sesión, registro, cierre de sesión y persistencia de la sesión. Este contexto está acompañado por su propio subdirectorio de tests, reflejando la importancia de garantizar el correcto funcionamiento de la autenticación.

Los custom hooks se agrupan en el directorio `hooks/` y representan una de las características más potentes de React para la reutilización de lógica. Aquí encontramos `useProducts.ts` que encapsula toda la lógica de obtención y manipulación de productos, `useCategories.ts` para la gestión de categorías, `use-mobile.tsx` para detectar si el usuario está en un dispositivo móvil, y `use-toast.ts` que proporciona un sistema de notificaciones toast reutilizable en toda la aplicación.

El directorio `lib/` contiene librerías y utilidades fundamentales del proyecto. El archivo más importante es `api.ts`, que implementa una clase `ApiService` centralizada para toda la comunicación con el backend. Este servicio incluye métodos para autenticación, gestión de productos, categorías, usuarios y comunicación con la API de Python para las funcionalidades de inteligencia artificial. El archivo `utils.ts` proporciona funciones utilitarias generales que se utilizan en diversos puntos de la aplicación.

Las páginas o vistas principales de la aplicación residen en el directorio `pages/`. Cada archivo representa una ruta accesible de la aplicación: `Home.tsx` es la página de inicio que muestra el hero section y las características principales, `Products.tsx` implementa el catálogo completo de productos con búsqueda y filtros, `ProductDetail.tsx` muestra los detalles de un producto individual, `VirtualTryOn.tsx` es la interfaz del probador virtual con IA, y páginas administrativas como `Admin.tsx`, `UserManagement.tsx` y `Reports.tsx` proporcionan funcionalidades de gestión para usuarios administradores.

El directorio `config/` centraliza todas las configuraciones de la aplicación. El archivo `env.ts` gestiona las variables de entorno y proporciona valores por defecto, facilitando la configuración de diferentes entornos (desarrollo, staging, producción). Las integraciones con servicios externos, como Supabase, se encuentran en el directorio `integrations/`, manteniendo todo el código relacionado con servicios de terceros aislado y fácil de actualizar o reemplazar.

### 1.3 Principios de Diseño Modular Implementados

La arquitectura modular implementada en este proyecto se fundamenta en varios principios clave de ingeniería de software. El principio de Separación de Responsabilidades (Separation of Concerns) se aplica rigurosamente, donde los componentes se encargan exclusivamente de la lógica de presentación y UI, los hooks contienen la lógica de negocio y estado reutilizable, los contexts gestionan el estado global de la aplicación, el código en `lib/` maneja la comunicación con servicios externos, y las páginas actúan como compositores que ensamblan componentes en vistas completas.

La reutilización de código es otro pilar fundamental de esta arquitectura. Los 49 componentes UI base proporcionados por el sistema de diseño Shadcn/UI son completamente reutilizables y se utilizan en toda la aplicación. Los custom hooks encapsulan lógica compleja que puede ser utilizada por múltiples componentes sin duplicación de código. El servicio API centralizado evita la repetición de código de comunicación HTTP en cada componente, y componentes de negocio como `SearchBar` y `ProductGrid` están diseñados para ser utilizados en diferentes contextos de la aplicación.

### 1.4 Configuración del Sistema de Módulos

La configuración del sistema de módulos es fundamental para el funcionamiento de la arquitectura modular. En el archivo `vite.config.ts`, se ha configurado un alias de ruta que mapea el símbolo `@` al directorio `./src`, permitiendo imports limpios y absolutos desde cualquier punto de la aplicación. Esto significa que en lugar de escribir rutas relativas complejas como `../../../components/Button`, podemos simplemente escribir `@/components/Button`, lo que hace el código más legible y menos propenso a errores cuando se mueven archivos.

La configuración de TypeScript en `tsconfig.json` complementa esta funcionalidad especificando en `compilerOptions` el `baseUrl` como punto de partida y definiendo en `paths` el mapeo de `@/*` a `./src/*`. Esta configuración sincronizada entre Vite y TypeScript asegura que tanto el sistema de construcción como el compilador de TypeScript entiendan correctamente los imports con alias.

El archivo `components.json` de Shadcn/UI define aliases adicionales específicos para el sistema de componentes, mapeando palabras clave como `components`, `utils`, `ui`, `lib` y `hooks` a sus respectivos directorios dentro de `@/`. Esta configuración facilita la instalación y actualización de componentes del sistema de diseño y mantiene la consistencia en toda la base de código.

### 1.5 Validación de la Arquitectura Modular

Para validar que el proyecto realmente implementa una arquitectura modular efectiva, se pueden aplicar varios criterios de evaluación. En términos de modularidad por función, cada componente está separado por su responsabilidad específica, los hooks personalizados encapsulan lógica reutilizable, los servicios API están centralizados, y los contextos manejan el estado global de manera aislada.

El bajo acoplamiento entre módulos se evidencia en que los componentes no dependen directamente del API sino que utilizan hooks intermediarios. Las props están tipadas con TypeScript, estableciendo contratos claros entre componentes. Los servicios pueden ser reemplazados o modificados sin afectar los componentes que los consumen, siempre que mantengan las interfaces definidas.

La alta cohesión se manifiesta en que cada módulo tiene una responsabilidad única y bien definida. Las funciones relacionadas están agrupadas en el mismo archivo, y los componentes UI genéricos están completamente separados de la lógica de negocio específica de la aplicación.

La escalabilidad del sistema se demuestra en que la estructura permite agregar nuevas páginas fácilmente simplemente creando un nuevo archivo en el directorio `pages/` y registrando la ruta en `App.tsx`. El sistema de componentes UI es extensible con 49 componentes base que pueden combinarse para crear interfaces complejas. Los hooks reutilizables facilitan la implementación de nuevas funcionalidades compartiendo lógica común.

Finalmente, la mantenibilidad se asegura mediante TypeScript que proporciona detección temprana de errores en tiempo de desarrollo. Los tests unitarios e integración garantizan que los cambios no introduzcan regresiones. Los path aliases mantienen los imports limpios y legibles, facilitando la navegación del código.

Para verificar empíricamente la estructura modular, se pueden ejecutar comandos en la terminal que revelan la organización del proyecto. El comando `tree frontend/src -L 2` muestra la estructura de directorios de forma visual, mientras que comandos como `find frontend/src/components/ui -name "*.tsx" | wc -l` cuentan exactamente cuántos componentes UI existen (49 en este caso), demostrando la extensión del sistema de diseño implementado.

---

## 2. CREACIÓN DE LA VISTA PRINCIPAL DEL CATÁLOGO

### 2.1 Arquitectura de la Vista de Catálogo

La vista principal del catálogo de productos, accesible a través de la ruta `/productos`, representa uno de los componentes más críticos de la aplicación desde la perspectiva del usuario. Esta vista no es un componente monolítico, sino una composición cuidadosa de múltiples módulos que trabajan en conjunto para proporcionar una experiencia de usuario fluida y eficiente.

El componente página principal, implementado en `Products.tsx`, actúa como el coordinador o controller de esta vista. Su responsabilidad principal no es renderizar elementos visuales complejos, sino gestionar el estado de la URL y coordinar la comunicación entre los componentes hijos. Utiliza el hook `useSearchParams` de React Router DOM para leer y modificar los parámetros de la URL, lo que permite que los filtros y búsquedas sean persistentes y compartibles mediante links.

Cuando un usuario accede a la página, el componente extrae los parámetros `search` y `category` de la URL. Si un usuario navega a `/productos?search=camisa&category=women`, el componente detecta estos parámetros y los pasa a los componentes correspondientes. Esta arquitectura basada en URL tiene múltiples ventajas: los usuarios pueden compartir enlaces con filtros específicos, el botón "atrás" del navegador funciona correctamente, y el estado de búsqueda se preserva al recargar la página.

El componente implementa dos handlers principales: `handleSearch` y `handleGenderFilter`. Cuando un usuario escribe en la barra de búsqueda, `handleSearch` actualiza los parámetros de la URL agregando o eliminando el parámetro `search` según corresponda. De manera similar, cuando un usuario selecciona un filtro de género, `handleGenderFilter` modifica el parámetro `category`. La sincronización automática entre estos cambios en la URL y la re-renderización de los componentes hijos es una característica poderosa de React Router que aprovechamos plenamente.

### 2.2 Componente ProductGrid: El Corazón de la Visualización

El componente `ProductGrid.tsx` es responsable de la visualización real de los productos y constituye la parte más compleja de la vista de catálogo. Este componente no solo renderiza una lista de productos, sino que implementa lógica sofisticada de filtrado, gestión de estado de carga, manejo de errores y optimizaciones de rendimiento.

Al inicializarse, el componente utiliza el hook personalizado `useProducts` para obtener los productos del backend. Este hook no es una simple llamada fetch, sino un sistema completo de gestión de datos que incluye estados de carga, manejo de errores, y funciones auxiliares para filtrado. El hook retorna objetos como `products` (el array de productos), `isLoading` (estado de carga), `error` (mensajes de error si existen), y funciones como `trackProductView`, `getProductsByGender`, `getProductsByCategory` y `searchProducts`.

La lógica de filtrado implementada en `ProductGrid` es particularmente interesante desde el punto de vista técnico. Utiliza el hook `useMemo` de React para crear una versión filtrada de los productos que se recalcula solo cuando cambian las dependencias relevantes. El proceso de filtrado es secuencial: primero filtra por género si se ha especificado uno (excluyendo "all"), luego aplica el filtro de categoría si está activo, y finalmente aplica la búsqueda por texto si existe un query.

Este orden de aplicación de filtros no es arbitrario. Filtrar primero por género reduce significativamente el conjunto de datos antes de aplicar filtros más costosos. El filtrado por categoría es un simple filtro de igualdad, relativamente rápido. El filtro de búsqueda por texto es potencialmente el más costoso porque debe comparar el query contra múltiples campos de cada producto (nombre, marca, categoría, género), por lo que se aplica al final sobre un conjunto de datos ya reducido.

El renderizado del grid utiliza un sistema responsivo de CSS Grid que adapta automáticamente el número de columnas según el tamaño de pantalla. En dispositivos móviles muestra una columna, en tablets dos columnas, y en desktop tres columnas. Esta responsividad no requiere JavaScript adicional, ya que se implementa completamente con las clases de Tailwind CSS.

Cada producto se renderiza como una Card con múltiples capas de información y acciones. La imagen del producto se muestra en un contenedor con aspect-ratio cuadrado, garantizando consistencia visual independientemente de las dimensiones originales de la imagen. La imagen tiene un efecto de zoom al hacer hover mediante la clase `group-hover:scale-105` y una transición suave de 500ms.

Los badges de disponibilidad e IA se posicionan absolutamente en la esquina superior izquierda. El badge de disponibilidad cambia entre "Disponible" (verde) y "Agotado" (rojo) según el stock. El badge de IA indica que el producto puede probarse con el probador virtual, una característica distintiva de la aplicación.

En la esquina superior derecha, botones de acción rápida aparecen al hacer hover: un botón de favoritos (corazón) y un botón para ver detalles (ojo). Estos botones tienen `opacity-0` por defecto y `group-hover:opacity-100`, creando una revelación suave al interactuar con la card.

Quizás la característica más innovadora es el overlay de "Probar con IA" que cubre toda la imagen cuando el usuario hace hover. Este overlay tiene un fondo semi-transparente con el color primario y muestra prominentemente un botón para iniciar el probador virtual. Al hacer clic, navega a la ruta `/probador-virtual` pasando la información del producto mediante el state de React Router, permitiendo que la página de prueba virtual tenga acceso inmediato a los datos del producto sin necesidad de una nueva llamada al API.

### 2.3 Gestión de Estados y Experiencia de Usuario

El manejo de diferentes estados de la aplicación es crucial para proporcionar una buena experiencia de usuario. El componente implementa tres estados principales: carga, error y vacío (sin resultados).

Durante el estado de carga (`isLoading === true`), se muestra un mensaje simple pero claro: "Cargando productos...". En aplicaciones futuras, esto podría mejorarse con skeleton screens que muestran placeholders del tamaño y forma de las cards de productos, proporcionando una mejor percepción de velocidad.

Cuando ocurre un error, el componente muestra un mensaje descriptivo en color rojo (usando la variante `destructive` del sistema de diseño), informando al usuario que algo salió mal sin términos técnicos confusos.

El estado vacío, cuando no se encuentran productos que coincidan con los filtros, merece especial atención. En lugar de simplemente mostrar "No hay productos", el componente ofrece una solución: un botón para "Ver todos los productos" que resetea todos los filtros. Este enfoque proactivo evita que los usuarios queden atascados con una búsqueda sin resultados.

### 2.4 Integración con el Backend

La integración con el backend se realiza de manera elegante y desacoplada a través del hook `useProducts`. Este hook encapsula toda la lógica de comunicación con la API, haciendo que el componente de UI permanezca limpio y enfocado en la presentación.

Internamente, `useProducts` utiliza el servicio `apiService` para hacer una petición GET al endpoint `/products`. El servicio está configurado con interceptores de Axios que automáticamente agregan el token de autenticación a cada petición si el usuario está autenticado, y manejan respuestas de error de manera centralizada, como redireccionar al login si el token expiró (status 401).

La respuesta del API puede venir en diferentes formatos dependiendo de si incluye paginación o no. El hook maneja esta ambigüedad intentando extraer primero `response.data.products`, luego `response.data`, y finalmente validando que el resultado sea un array. Esta flexibilidad permite que el frontend funcione correctamente incluso si el formato de respuesta del backend cambia ligeramente.

El hook también proporciona funciones auxiliares de filtrado local. Aunque el filtrado podría realizarse en el backend, implementarlo en el frontend proporciona respuestas instantáneas a las acciones del usuario sin latencia de red. Esta es una decisión de arquitectura válida para catálogos de tamaño moderado. Para catálogos muy grandes (decenas de miles de productos), sería preferible implementar el filtrado y búsqueda en el backend.

---

## 3. IMPLEMENTACIÓN DEL MÓDULO DE BÚSQUEDA Y FILTRADO DE PRENDAS

### 3.1 Componente SearchBar: Búsqueda en Tiempo Real

La funcionalidad de búsqueda es fundamental en cualquier aplicación de e-commerce, y su implementación debe ser tanto eficiente como intuitiva. El componente `SearchBar.tsx` implementa una búsqueda en tiempo real con una interfaz limpia y accesible.

El componente es un ejemplo perfecto de un componente controlado en React. Mantiene su propio estado local (`query`) que se sincroniza bidireccionalmente con el input. Cada vez que el usuario escribe una letra, el evento `onChange` actualiza el estado local y simultáneamente invoca la función `onSearch` pasada como prop, notificando al componente padre del cambio.

La interfaz visual está cuidadosamente diseñada para la usabilidad. Un ícono de lupa se posiciona absolutamente en el lado izquierdo del input, utilizando transform para centrarlo verticalmente. Este ícono es puramente decorativo pero proporciona un fuerte affordance visual que comunica claramente la función de búsqueda. Cuando el usuario escribe algo, aparece un botón con una X en el lado derecho, permitiendo limpiar la búsqueda con un solo clic. Este patrón es familiar para los usuarios de aplicaciones modernas y reduce la fricción en la experiencia de uso.

La implementación del botón de limpiar es condicional (`{query && ...}`), por lo que solo se renderiza cuando hay texto en el input. Esto mantiene la interfaz limpia cuando no es necesario. Al hacer clic en la X, se ejecuta `clearSearch` que resetea tanto el estado local como notifica al padre con una cadena vacía, eliminando efectivamente todos los filtros de búsqueda.

Los estilos aplicados utilizan las variables de diseño del sistema, como `text-muted-foreground` para el ícono y `bg-muted/50` para el fondo del input, garantizando consistencia visual con el resto de la aplicación. El modificador `focus-visible:ring-accent` proporciona feedback visual cuando el input está enfocado, crucial para la accesibilidad del teclado.

### 3.2 Sistema de Filtrado por Categorías

El componente `CategoryFilter.tsx` implementa un sistema de filtrado por categorías que es dinámico y está completamente integrado con el backend. A diferencia de un sistema de filtros hardcodeado, este componente obtiene las categorías disponibles directamente de la API, permitiendo que administradores agreguen, modifiquen o eliminen categorías sin necesidad de cambiar el código del frontend.

El componente utiliza el hook `useCategories`, que es análogo a `useProducts` pero específico para categorías. Este hook maneja el ciclo de vida completo de la obtención de datos: estado de carga inicial, manejo de errores, y almacenamiento de los datos obtenidos. La carga se realiza una sola vez cuando el componente se monta, y los datos se cachean en el estado del componente.

Durante el estado de carga, el componente renderiza tres skeleton loaders en forma de píldoras (botones redondeados). Estos skeletons utilizan la clase `animate-pulse` de Tailwind que crea una animación de respiración, proporcionando feedback visual de que algo está cargando sin utilizar spinners tradicionales que pueden ser visualmente agresivos.

Una vez que las categorías se cargan, el componente renderiza un botón "Todos" seguido de un botón para cada categoría. El botón activo se distingue visualmente utilizando la variante `default` (relleno sólido con color primario), mientras que los botones inactivos utilizan la variante `outline` (solo borde). Esta distinción visual clara ayuda a los usuarios a entender qué filtro está activo en cualquier momento.

Los botones tienen la clase `rounded-full` que les da forma de píldora, un patrón de diseño moderno y limpio que se ha popularizado en aplicaciones contemporáneas. El layout utiliza `flex flex-wrap`, permitiendo que los botones se ajusten naturalmente a múltiples líneas si hay muchas categorías, manteniendo la interfaz funcional independientemente del número de categorías.

### 3.3 Lógica de Búsqueda Multi-Campo

La implementación de la búsqueda por texto en el hook `useProducts` es particularmente sofisticada. La función `searchProducts` no busca solo en el nombre del producto, sino en múltiples campos relevantes, proporcionando resultados más completos y útiles.

Cuando un usuario escribe "nike azul", la búsqueda examina el nombre del producto (quizás "Nike Air Max"), la marca (si está disponible, "Nike"), el nombre de la categoría ("Calzado deportivo"), y el género ("Men"). Si alguno de estos campos coincide con el query, el producto se incluye en los resultados. Esta búsqueda multi-campo es esencial para una buena experiencia de usuario, ya que los usuarios pueden buscar de diferentes maneras: por marca, tipo de producto, color, o género.

La implementación maneja casos edge correctamente. Verifica que campos opcionales como `brand` y `category.name` existan antes de intentar la comparación, evitando errores de null reference. Convierte todo a minúsculas antes de comparar (`toLowerCase()`), haciendo la búsqueda insensible a mayúsculas, que es lo que los usuarios esperan.

El método `includes` se usa en lugar de igualdad exacta, permitiendo búsquedas parciales. Un usuario puede escribir "cam" y encontrar "camisa", "camiseta", y "pantalón de camuflaje". Esta flexibilidad es importante para la usabilidad pero también introduce el desafío de potencialmente retornar demasiados resultados. En una implementación futura, se podría implementar un sistema de ranking donde coincidencias exactas aparecen primero, seguidas de coincidencias parciales.

### 3.4 Filtrado por Género con Lógica de Inclusión

El filtrado por género, implementado en `getProductsByGender`, tiene lógica especial para manejar productos unisex. Si un usuario selecciona "Hombres", obtiene productos marcados como "men" pero también productos "unisex", ya que estos son apropiados para ambos géneros. Esta lógica de inclusión mejora la experiencia del usuario al mostrar todas las opciones relevantes.

La función primero verifica si el filtro es "all", en cuyo caso retorna todos los productos sin filtrar. Para "women" y "men", hace comparaciones específicas en minúsculas para evitar problemas con inconsistencias en el capitalización de los datos. La comparación con "unisex" se realiza solo para géneros que no son "women" o "men" directamente, permitiendo flexibilidad en la categorización.

### 3.5 Combinación de Filtros y Optimización de Rendimiento

La verdadera potencia del sistema de filtrado emerge cuando múltiples filtros se combinan. Un usuario podría estar buscando "camisas" (búsqueda), en la categoría "Ropa casual" (categoría), para "Mujeres" (género). El componente `ProductGrid` implementa esta combinación usando `useMemo`, que es crucial para el rendimiento.

Sin `useMemo`, el filtrado se recalcularía en cada render, incluso si los productos o filtros no han cambiado. Con `useMemo`, React cachea el resultado y solo recalcula cuando una de las dependencias especificadas cambia. Estas dependencias incluyen `products`, `activeCategory`, `searchQuery`, `localSearchQuery`, y `genderFilter`.

El orden de aplicación de filtros es estratégico. Filtrar por género primero puede eliminar potencialmente el 50% de los productos inmediatamente si el catálogo está equilibrado entre productos de hombres y mujeres. El filtro de categoría se aplica segundo, reduciendo aún más el conjunto. Finalmente, la búsqueda por texto se aplica al conjunto ya reducido, minimizando el número de comparaciones de strings costosas.

### 3.6 Persistencia y Compartibilidad mediante URL

Una característica sofisticada pero a menudo subestimada es la persistencia de filtros en la URL. Cuando un usuario aplica filtros y comparte el enlace, otra persona que abra ese enlace verá exactamente los mismos filtros aplicados. Esto es posible porque el componente `Products` lee los parámetros de URL al montarse y los pasa a sus componentes hijos.

La manipulación de URL se realiza mediante `useSearchParams`, que proporciona una interfaz similar a `useState` pero sincronizada con la URL. Al actualizar los parámetros, React Router automáticamente actualiza la barra de direcciones del navegador sin recargar la página, y re-renderiza los componentes que dependen de esos parámetros.

Esta arquitectura basada en URL tiene implicaciones profundas para la SEO y la experiencia de usuario. Cada combinación de filtros es técnicamente una URL única que los motores de búsqueda pueden indexar. Los usuarios pueden usar el botón atrás del navegador para deshacer cambios de filtros. Pueden marcar páginas con sus filtros favoritos. Esta funcionalidad, que parece simple en la superficie, eleva significativamente la calidad profesional de la aplicación.

### 3.7 Integración con el Backend para Categorías Dinámicas

El hook `useCategories` implementa el patrón completo de carga de datos asíncronos. Inicia con `isLoading: true`, intenta obtener las categorías del endpoint `/categories`, y actualiza el estado según el resultado. Si la petición es exitosa, almacena las categorías en el estado local. Si falla, almacena el mensaje de error.

Este hook también proporciona una función `refetch` que permite recargar las categorías manualmente. Esto es útil en escenarios administrativos donde un usuario acaba de agregar una nueva categoría y quiere ver los cambios reflejados inmediatamente sin recargar toda la página.

El manejo de errores es graceful. Si las categorías no se cargan, el array de categorías permanece vacío, lo que resulta en que solo el botón "Todos" se muestre. La aplicación no se rompe, solo tiene funcionalidad reducida. En una implementación completa, se podría mostrar un mensaje de error y un botón de reintento.

---

## 4. DESARROLLO DE LA VISTA DE DETALLE CON OPCIÓN DE PREVISUALIZACIÓN INICIAL

### 4.1 Arquitectura de la Página de Detalle del Producto

La página de detalle del producto, implementada en `ProductDetail.tsx`, representa la culminación de la experiencia de navegación del usuario. Después de explorar el catálogo y encontrar un producto de interés, el usuario hace clic para ver los detalles completos. Esta página debe proporcionar toda la información necesaria para que el usuario tome una decisión de compra informada, y debe hacer de manera visualmente atractiva y fácil de navegar.

La estructura general de la página utiliza un layout de dos columnas en dispositivos grandes, que colapsa a una sola columna en móviles. Esta decisión de diseño es común en e-commerce porque equilibra la necesidad de mostrar imágenes grandes y claras con la necesidad de proporcionar información detallada sin requerir demasiado desplazamiento vertical.

El componente comienza obteniendo el ID del producto desde la URL usando `useParams` de React Router. Este patrón de routing dinámico permite que una sola implementación de componente maneje cualquier producto, simplemente cambiando el parámetro de la URL. Cuando el componente se monta, un `useEffect` se ejecuta para obtener los datos del producto desde el backend.

La carga del producto es asíncrona y puede fallar por múltiples razones: el producto no existe, hay un error de red, el servidor está caído, etc. El componente maneja estos casos cuidadosamente. Durante la carga, muestra un skeleton screen completo que aproxima el layout final de la página. Si la carga falla, redirige al usuario de vuelta al catálogo de productos después de mostrar un mensaje de error mediante el sistema de toast.

Una vez que los datos se cargan exitosamente, el componente inicializa los valores por defecto para la interacción del usuario. Si el producto tiene tallas disponibles, selecciona automáticamente la primera como default. Si tiene un color, lo establece como seleccionado. Estas inicializaciones reducen el número de clics que el usuario necesita hacer antes de poder agregar el producto al carrito.

### 4.2 Galería de Imágenes Interactiva

La galería de imágenes es un componente crucial de la página de detalle, ya que en e-commerce la presentación visual del producto es fundamental para la conversión. La implementación utiliza un estado local (`selectedImageIndex`) para rastrear qué imagen está visible actualmente en la vista principal.

La imagen principal se muestra en un contenedor cuadrado (usando `aspect-square`) que proporciona un marco consistente independientemente de las proporciones reales de la imagen. La imagen se escala para cubrir este espacio usando `object-cover`, lo que significa que la imagen se recortará si es necesario para llenar el espacio sin distorsión.

Un aspecto importante de la implementación es el manejo de errores de carga de imágenes. Cada elemento `img` tiene un handler `onError` que, si la imagen falla al cargar, la reemplaza con una imagen placeholder. Esto previene que imágenes rotas arruinen la experiencia del usuario, un problema común en aplicaciones que dependen de URLs de imágenes externas.

Debajo de la imagen principal, si hay más de una imagen disponible, se renderiza un grid de thumbnails (miniaturas). Estas miniaturas son versiones más pequeñas de las imágenes que actúan como navegación. El thumbnail correspondiente a la imagen actualmente mostrada tiene un borde primario de 2px, proporcionando feedback visual claro. Los thumbnails inactivos tienen un borde transparente que se vuelve visible al hacer hover, creando una transición suave.

La interacción es simple: hacer clic en cualquier thumbnail actualiza `selectedImageIndex`, lo que causa que React re-renderice el componente mostrando la nueva imagen en la vista principal. Esta simplicidad es engañosa; React maneja eficientemente estas actualizaciones gracias a su Virtual DOM, re-renderizando solo los elementos que cambiaron.

### 4.3 Sección de Información del Producto

La sección de información está cuidadosamente estructurada para presentar los datos del producto en un orden lógico que guía al usuario hacia la compra. Comienza con badges que proporcionan información contextual rápida: la marca (si está disponible), un badge de IA indicando compatibilidad con el probador virtual, y el estado de disponibilidad (verde para disponible, rojo para agotado).

El título del producto es prominente, usando `text-3xl` y `font-bold`, asegurando que es el elemento más destacado de la sección. Inmediatamente debajo, una simulación de rating con estrellas amarillas llenas proporciona credibilidad social. Aunque en esta implementación el rating es estático, en una aplicación completa se obtendría de reviews reales de usuarios y sería dinámico.

El precio se muestra en un tamaño grande y color primario, haciendo que sea imposible pasarlo por alto. Se usa `toLocaleString()` para formatear el número con separadores de miles apropiados según la localización del usuario, mejorando la legibilidad de precios grandes.

La descripción del producto, si existe, se muestra en un bloque separado con un encabezado claro. El texto usa el color `text-muted-foreground`, que es ligeramente más tenue que el texto normal, adecuado para contenido secundario pero aún completamente legible.

### 4.4 Selección de Opciones del Producto

Los selectores de talla, color y cantidad son componentes interactivos cruciales que permiten al usuario configurar exactamente qué variante del producto desean. El selector de tallas renderiza un botón para cada talla disponible. El botón de la talla seleccionada usa la variante `default` (fondo sólido), mientras que las no seleccionadas usan `outline`.

Esta implementación tiene implicaciones importantes para la experiencia de usuario. Un usuario puede ver todas las tallas disponibles de un vistazo y cambiar entre ellas con un solo clic. Si una talla está agotada, podría deshabilitarse visualmente (aunque esta funcionalidad requeriría información adicional del backend sobre stock por talla).

El selector de color usa un enfoque visual diferente. En lugar de botones de texto, muestra un círculo de color (un div con `border-radius: 50%`) cuyo color de fondo se establece dinámicamente usando el valor de color del producto. Al lado del círculo, el nombre del color aparece capitalizado. Este enfoque dual (visual y textual) es accesible y claro.

El selector de cantidad implementa un patrón de incremento/decremento común en aplicaciones de compras. Dos botones (- y +) flanquean el número actual. El botón de decremento se deshabilita cuando la cantidad es 1 (no se puede pedir menos de un producto), y el botón de incremento se deshabilita cuando se alcanza el stock disponible. Este diseño previene que el usuario intente pedir más productos de los que existen, evitando errores frustrantes en el checkout.

La implementación usa `Math.max(1, quantity - 1)` y `Math.min(product.stockQuantity, quantity + 1)` para asegurar que la cantidad siempre permanezca dentro de límites válidos, proporcionando una capa adicional de validación más allá de la deshabilitación de botones.

### 4.5 Botones de Acción y Flujo de Compra

La sección de acciones del usuario contiene múltiples botones que permiten diferentes interacciones con el producto. El botón principal "Agregar al carrito" es el Call-to-Action (CTA) más importante de toda la página. Ocupa la mayor parte del ancho (`flex-1`), haciéndolo prominente y fácil de tocar/clickear.

Este botón implementa validación antes de permitir la acción. Si el usuario no ha seleccionado una talla (y el producto tiene tallas), el botón está deshabilitado y un tooltip o mensaje de toast informa al usuario que debe seleccionar una talla primero. Esta validación preventiva es mejor UX que permitir al usuario hacer clic y luego mostrar un error.

Junto al botón principal hay dos botones de acción secundaria con tamaño de ícono: favoritos y compartir. El botón de favoritos implementa un estado local (`isFavorite`) que alterna entre un corazón vacío y uno lleno y coloreado. Cuando se activa, muestra un toast confirmando la acción. En una aplicación completa, esto también haría una llamada al backend para persistir el favorito.

El botón de compartir utiliza la Web Share API moderna cuando está disponible (principalmente en dispositivos móviles), permitiendo al usuario compartir el producto a través de aplicaciones nativas como WhatsApp, email, etc. En navegadores de escritorio que no soportan la API, hace fallback a copiar el enlace al portapapeles. Este enfoque de progressive enhancement asegura que la funcionalidad esté disponible en todos los dispositivos mientras aprovecha capacidades nativas cuando sea posible.

El segundo CTA importante es el botón "Probar con IA", que es único de esta aplicación y representa su propuesta de valor diferenciadora. Este botón tiene la variante `secondary` para distinguirlo del CTA principal pero aún es prominente. Al hacer clic, navega a la ruta `/probador-virtual` usando `navigate` con un objeto `state` que contiene información del producto.

Este patrón de pasar datos mediante state de React Router es elegante para datos temporales que no necesitan persistir en la URL. La página del probador virtual puede acceder a estos datos mediante `useLocation().state`, obteniendo instantáneamente la información necesaria sin una llamada adicional al API.

### 4.6 Card de Detalles del Producto

En la parte inferior de la sección de información, una Card muestra detalles adicionales del producto en formato de tabla de dos columnas. Esta sección usa el componente `Card` del sistema de diseño con `CardHeader` y `CardContent`, manteniendo consistencia visual con otras partes de la aplicación.

Los detalles mostrados incluyen género, categoría, stock disponible y estado de disponibilidad. Cada fila usa `flex justify-between` para separar la etiqueta y el valor, creando un layout limpio y fácil de escanear visualmente. La etiqueta usa `text-muted-foreground` para reducir su prominencia visual, mientras que el valor usa el color de texto normal, creando una jerarquía visual clara.

El estado de disponibilidad usa colores semánticos: verde para disponible, rojo para no disponible. Estos colores son universalmente reconocidos y ayudan a los usuarios a evaluar rápidamente el estado del producto.

### 4.7 Estados de Carga y Manejo de Errores

La implementación de estados de carga y error es crucial para la robustez de la aplicación. Durante la carga inicial, el componente renderiza un skeleton screen completo que aproxima el layout final. Este skeleton incluye rectángulos grises pulsantes para la imagen principal, thumbnails, título, precio y descripción.

Los skeleton screens son preferibles a spinners porque proporcionan contexto sobre qué se está cargando y dónde aparecerá, reduciendo la percepción de latencia. La animación de pulse es sutil pero efectiva para comunicar que se está trabajando en cargar contenido.

Si el producto no se encuentra o hay un error, el componente muestra una página de error limpia con un mensaje claro, explicación breve y un botón para volver al catálogo. Este manejo graceful de errores previene que los usuarios queden atascados en una página rota. El mensaje usa lenguaje amigable ("El producto que buscas no existe o ha sido eliminado") en lugar de mensajes técnicos de error.

### 4.8 Navegación y Breadcrumbs

En la parte superior de la página, un breadcrumb trail muestra la jerarquía de navegación: Productos / [Nombre del Producto]. El primer elemento es un enlace clickeable que regresa al catálogo, mientras que el último elemento (el producto actual) no es clickeable pero muestra en qué página estás.

Además del breadcrumb, hay un botón "Volver a productos" con un ícono de flecha izquierda. Esta redundancia en navegación es intencional: diferentes usuarios tienen diferentes preferencias sobre cómo navegar. Los breadcrumbs son familiares para usuarios de web, mientras que el botón "Volver" es más intuitivo para usuarios de móviles acostumbrados a botones de navegación.

### 4.9 Componente ProductPreview: Vista Rápida Modal

Aunque no es parte de la página de detalle en sí, el componente `ProductPreview` proporciona una funcionalidad relacionada que merece mención. Este componente implementa un modal que se puede abrir desde el catálogo de productos, mostrando información esencial del producto sin navegar a la página completa de detalle.

Esta "vista rápida" es común en sitios de e-commerce modernos porque reduce la fricción para usuarios que quieren ver rápidamente varios productos. Pueden abrir la vista rápida, verificar tallas disponibles y precio, cerrarla, y abrir otra, todo sin perder su lugar en el catálogo o esperar navegaciones de página completa.

El modal utiliza el componente `Dialog` del sistema de diseño, que implementa correctamente la accesibilidad del teclado (cerrar con ESC), gestión del foco (focus trap), y prevención de scroll del body mientras está abierto. Estas consideraciones de accesibilidad son cruciales para una aplicación profesional pero a menudo se pasan por alto en implementaciones rápidas.

### 4.10 Integración con el Probador Virtual

La integración entre la página de detalle y el probador virtual es un ejemplo excelente de comunicación entre componentes en una SPA. Cuando el usuario hace clic en "Probar con IA", el handler `handleVirtualTryOn` ejecuta:

```typescript
navigate('/probador-virtual', {
  state: {
    product: {
      id: product.id,
      name: product.name,
      images: product.images,
      brand: product.brand,
      price: product.price,
    }
  }
});
```

Esto navega a la ruta del probador virtual, pasando un objeto con información esencial del producto. El probador virtual puede entonces acceder a esta información mediante:

```typescript
const location = useLocation();
const productData = location.state?.product;
```

Este patrón evita la necesidad de volver a obtener los datos del producto desde el backend, mejorando el rendimiento y reduciendo latencia. También maneja gracefully el caso donde un usuario navega directamente a la URL del probador virtual sin pasar por la página de detalle (en ese caso, `state` sería undefined y el componente podría pedir al usuario que seleccione un producto).

La información pasada incluye las imágenes del producto, que son esenciales para el probador virtual. El sistema de IA necesita la imagen de la prenda para combinarla con la foto del usuario. Pasar estas URLs directamente evita una segunda búsqueda de datos.

### 4.11 Responsividad y Adaptación Móvil

La página de detalle está completamente optimizada para dispositivos móviles. El layout de dos columnas (`grid grid-cols-1 lg:grid-cols-2`) colapsa a una sola columna en pantallas pequeñas. En móviles, el usuario primero ve las imágenes, luego desplaza hacia abajo para ver la información y opciones de compra.

El grid de thumbnails se mantiene en 4 columnas incluso en móvil (`grid-cols-4`), aunque las imágenes son más pequeñas. Esta decisión mantiene todas las vistas del producto visibles sin requerir desplazamiento horizontal, que es particularmente problemático en dispositivos táctiles.

Los botones de acción ajustan su tamaño y espaciado en móviles. El botón de "Agregar al carrito" permanece grande y fácil de tocar, cumpliendo con las pautas de tamaño mínimo de objetivo táctil (44x44px mínimo recomendado por Apple y Google).

Los selectores de talla también están optimizados para touch. Los botones tienen padding suficiente para ser objetivos táctiles cómodos, y hay espacio entre ellos para prevenir clicks accidentales. Esta atención al detalle en la interacción táctil es crucial para conversión en móviles, que representa una porción significativa del tráfico de e-commerce.

### 4.12 Integración con el Backend y Tipado TypeScript

La comunicación con el backend se realiza mediante el método `apiService.getProduct(id)`, que retorna una promesa que resuelve a un objeto tipado como `ApiResponse<Product>`. Esta respuesta puede contener `data` (el producto exitosamente obtenido) o `error` (un mensaje de error si algo salió mal).

El tipado de TypeScript para `Product` define exactamente qué campos esperar:

```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  brand?: string;
  color?: string;
  sizes: string[];
  images: string[];
  stockQuantity: number;
  isActive: boolean;
  gender: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}
```

Este tipado fuerte proporciona múltiples beneficios. TypeScript puede verificar en tiempo de compilación que se están accediendo campos correctos y con los tipos correctos. Los IDEs pueden proporcionar autocompletado preciso al escribir código. Si el formato de respuesta del backend cambia, TypeScript detectará la discrepancia inmediatamente, en lugar de descubrir el error en runtime después del despliegue.

Los campos opcionales (marcados con `?`) como `description`, `brand` y `color` se manejan con verificaciones de existencia antes de renderizar (`{product.description && ...}`). Esto previene errores de rendering cuando esos campos no están presentes en los datos.

---

## 5. FLUJO DE DATOS Y ESTADO EN LA APLICACIÓN

### 5.1 Arquitectura de Gestión de Estado

La gestión de estado en aplicaciones React modernas es un desafío complejo que esta aplicación aborda mediante una combinación de estrategias. El estado se clasifica en tres categorías principales: estado local de componentes, estado global de aplicación y estado del servidor.

El estado local de componentes, gestionado con `useState` y `useReducer`, se utiliza para datos que solo son relevantes para un componente específico. Ejemplos incluyen qué imagen está seleccionada en la galería de productos, si un modal está abierto, o qué pestaña está activa en un componente de tabs. Este estado no necesita ser compartido con otros componentes y debe permanecer encapsulado.

El estado global de aplicación, implementado mediante Context API, se usa para datos que múltiples componentes en diferentes partes del árbol de componentes necesitan acceder. El ejemplo principal es el contexto de autenticación (`AuthContext`), que proporciona información del usuario actual y funciones para login, logout y registro. Cualquier componente puede usar `useAuth()` para acceder a estos datos sin necesidad de prop drilling.

El estado del servidor, gestionado por los custom hooks y TanStack Query, representa datos que viven en el backend pero necesitan ser accesibles en el frontend. Productos, categorías y datos de usuarios son ejemplos. Este estado requiere manejo especial porque es asíncrono (requiere tiempo para obtener) y puede estar desactualizado (el backend puede cambiar mientras el frontend tiene una copia cacheada).

### 5.2 Flujo de Datos desde el Backend

El flujo de datos comienza cuando un componente necesita datos del servidor. Por ejemplo, cuando `ProductGrid` se monta, llama al hook `useProducts()`. Este hook verifica si ya tiene productos cacheados. Si no, inicia una petición HTTP usando `apiService.getProducts()`.

El `ApiService` es una clase singleton que encapsula toda la comunicación HTTP. Está configurado con interceptores de Axios que automáticamente agregan headers de autenticación a cada petición. Cuando la respuesta llega, otro interceptor verifica el código de estado. Si es 401 (no autorizado), automáticamente limpia el token almacenado y redirige al usuario a la página de login.

La respuesta exitosa fluye de vuelta al hook, que actualiza su estado local con los datos recibidos. Este cambio de estado causa que React re-renderice cualquier componente que use este hook, mostrando los nuevos datos. Si hay un error, el hook actualiza su estado de error, que el componente puede usar para mostrar un mensaje apropiado al usuario.

Este patrón de flujo unidireccional de datos es fundamental en React. Los datos fluyen hacia abajo desde hooks y contexts a componentes mediante props, y eventos fluyen hacia arriba mediante callbacks. Este flujo predecible hace que el código sea más fácil de razonar y depurar.

### 5.3 Sistema de Configuración Ambiental

La configuración de entornos diferentes (desarrollo, staging, producción) se gestiona mediante variables de entorno de Vite. El archivo `env.ts` importa estas variables y proporciona valores por defecto razonables:

```typescript
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  pythonApiUrl: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

Durante el desarrollo local, si no se especifican variables de entorno, se usan los valores por defecto que apuntan a servidores locales. En producción, estas variables se configuran en el servicio de hosting (como Vercel) para apuntar a los backends de producción.

Este sistema de configuración permite que el mismo código funcione en múltiples entornos sin modificaciones. No hay URLs hardcodeadas en el código de la aplicación; todas se leen de esta configuración centralizada.

### 5.4 Autenticación y Autorización

El sistema de autenticación implementado en `AuthContext` proporciona funcionalidad completa de gestión de usuarios. Cuando un usuario hace login, el contexto llama a `apiService.login()`, que envía credenciales al backend. Si son válidas, el backend retorna un token JWT y datos del usuario.

El token se almacena en localStorage bajo la clave `auth_token`. En peticiones subsecuentes, el interceptor de Axios lee este token y lo agrega al header `Authorization: Bearer [token]`. El backend valida este token en cada petición protegida, asegurando que solo usuarios autenticados pueden acceder a recursos protegidos.

El contexto también proporciona el objeto `user` actual, que componentes pueden usar para personalizar la UI. Por ejemplo, el header muestra "Bienvenido, [nombre]" si hay un usuario autenticado, o botones de "Login/Registro" si no. Componentes administrativos pueden verificar `user.role` para mostrar u ocultar funcionalidad según permisos.

Cuando el usuario hace logout, el contexto limpia el token de localStorage y resetea el estado del usuario a null. Esto propaga automáticamente a todos los componentes que dependen del contexto, actualizando la UI instantáneamente.

### 5.5 Sistema de Notificaciones Toast

El sistema de notificaciones utiliza el hook `useToast` que proporciona una API simple para mostrar mensajes temporales al usuario. Cuando un evento significativo ocurre (producto agregado al carrito, error al cargar datos, login exitoso), el código llama a `toast()` con un objeto que describe el mensaje.

El componente `Toaster`, montado en el root de la aplicación, escucha estos eventos y renderiza las notificaciones en una ubicación consistente (típicamente esquina superior derecha). Las notificaciones aparecen con una animación, permanecen visibles brevemente, y desaparecen automáticamente, sin requerir acción del usuario.

Este sistema centralizado de notificaciones mejora la UX al proporcionar feedback consistente y no intrusivo. Es mejor que usar `alert()` nativo, que bloquea la interacción, o logs de consola, que los usuarios finales no ven.

---

## 6. OPTIMIZACIÓN Y RENDIMIENTO

### 6.1 Estrategias de Optimización Implementadas

El rendimiento de la aplicación se ha optimizado mediante varias técnicas. La memoización con `useMemo` previene recálculos costosos de datos filtrados. Sin memoización, el filtrado de productos se ejecutaría en cada render, incluso si los productos y filtros no han cambiado. Con `useMemo`, React cachea el resultado y solo recalcula cuando las dependencias cambian.

Las imágenes implementan lazy loading mediante el atributo `loading="lazy"` de HTML5 (aunque no explícitamente visible en el código mostrado, es una mejora recomendada). Esto significa que imágenes fuera de la viewport inicial no se cargan hasta que el usuario desplaza hacia ellas, reduciendo el tiempo de carga inicial de la página.

El sistema de construcción de Vite proporciona optimizaciones automáticas significativas. Vite realiza tree-shaking, eliminando código JavaScript que nunca se usa. Minifica el código, reduciendo el tamaño de archivo. Y automáticamente divide el código en chunks más pequeños, permitiendo que el navegador cargue solo el JavaScript necesario para la página actual.

Tailwind CSS, como framework utility-first, permite un CSS extremadamente optimizado. En producción, Tailwind automáticamente purga clases no utilizadas, resultando en archivos CSS pequeños. Esto contrasta con frameworks tradicionales como Bootstrap donde se envía todo el CSS incluso si solo usas una fracción.

### 6.2 Análisis de Bundle y Optimización de Carga

El comando `npm run build` genera un build de producción optimizado. Los assets resultantes se colocan en `dist/`, con JavaScript y CSS hasheados para cache busting. El análisis del tamaño de estos archivos revela la composición del bundle y oportunidades de optimización.

En una implementación futura, se podría integrar code splitting basado en rutas usando `React.lazy` y `Suspense`. Esto significa que el código para la página de administración no se cargaría hasta que un usuario administrador acceda a esa ruta, reduciendo el bundle inicial para usuarios regulares.

---

## 7. TESTING Y CALIDAD DEL CÓDIGO

### 7.1 Infraestructura de Testing

El proyecto incluye configuración completa para testing con Jest y React Testing Library. Los scripts de npm permiten ejecutar tests en diferentes modos: ejecución única (`npm run test`), modo watch para desarrollo (`npm run test:watch`), y generación de reportes de cobertura (`npm run test:coverage`).

React Testing Library se enfoca en testing desde la perspectiva del usuario, verificando que los componentes se comporten correctamente cuando se renderizan y reciben interacción, en lugar de testing de detalles de implementación internos. Esta filosofía produce tests más resilientes a refactorización.

El proyecto incluye tests para contextos como `AuthContext`, asegurando que funcionalidad crítica como login y logout funcione correctamente. También hay tests de integración que verifican flujos completos de usuario, como navegar del catálogo al detalle de producto y al probador virtual.

### 7.2 Linting y Estándares de Código

ESLint está configurado con reglas específicas para React y TypeScript, detectando automáticamente problemas potenciales como variables no usadas, imports innecesarios, hooks de React mal usados, y más. El comando `npm run lint` verifica todo el código y reporta problemas.

Las reglas incluyen plugins específicos como `react-hooks` que verifica las reglas de hooks de React (hooks solo en el top level, dependencias correctas en arrays de dependencia, etc.). Estos problemas son difíciles de detectar manualmente pero pueden causar bugs sutiles.

---

## 8. DEPLOYMENT Y PRODUCCIÓN

### 8.1 Configuración de Vercel

El proyecto está configurado para deployment en Vercel, una plataforma especializada en aplicaciones frontend. El archivo `vercel.json` especifica configuraciones como redirects para el routing de SPA. Cuando un usuario navega directamente a `/productos/123`, Vercel necesita servir `index.html` y dejar que React Router maneje la ruta, en lugar de buscar un archivo `/productos/123.html` que no existe.

Las variables de entorno se configuran en el dashboard de Vercel, permitiendo diferentes configuraciones para preview deployments (creados automáticamente para cada pull request) y producción. Esta configuración facilita el desarrollo y testing antes de desplegar a producción.

### 8.2 Pipeline de Construcción

El proceso de build comienza cuando código se empuja a la rama principal de Git. Vercel detecta el push, clona el repositorio, instala dependencias con npm, ejecuta `npm run build`, y despliega los archivos estáticos resultantes a su CDN global.

El build de Vite optimiza automáticamente todo: minifica JavaScript y CSS, comprime imágenes, genera sourcemaps para debugging, y produce archivos con hashes en los nombres para cache busting óptimo. El resultado es un sitio estático que se carga extremadamente rápido.

---

## 9. MÉTRICAS Y CONCLUSIONES

### 9.1 Métricas del Proyecto

El proyecto frontend representa un esfuerzo de desarrollo significativo. Con más de 100 archivos TypeScript/TSX, el código está organizado de manera que facilita navegación y mantenimiento. Los 49 componentes UI base del sistema de diseño proporcionan una fundación sólida para construir cualquier interfaz, manteniendo consistencia visual.

Las 13 páginas principales cubren todas las funcionalidades esperadas de una aplicación de e-commerce con probador virtual: navegación de catálogo, detalle de productos, autenticación, perfil de usuario, administración, reportes y la funcionalidad estrella del probador virtual con IA.

Los 4 custom hooks principales (`useProducts`, `useCategories`, `useAuth`, `useToast`) encapsulan lógica compleja y proporcionan APIs simples para componentes. Esta separación de responsabilidades mantiene los componentes limpios y enfocados en presentación.

La integración con más de 15 endpoints del backend demuestra una aplicación completa que no solo muestra datos estáticos sino que interactúa dinámicamente con un sistema backend complejo, incluyendo autenticación, gestión de productos, categorías, usuarios y servicios de IA.

### 9.2 Logros Técnicos Destacados

La implementación exitosa de una arquitectura modular basada en separación de responsabilidades establece una base sólida para el crecimiento futuro del proyecto. Los nuevos desarrolladores pueden entender rápidamente la estructura y comenzar a contribuir sin necesidad de entender todo el codebase.

El sistema de componentes reutilizables con 49 componentes base permite desarrollo rápido de nuevas funcionalidades sin reinventar la rueda. Cualquier nueva página puede usar estos componentes existentes, manteniendo automáticamente consistencia visual y de comportamiento.

La búsqueda y filtrado en tiempo real con múltiples criterios combinables proporciona una experiencia de usuario fluida que rivaliza con sitios de e-commerce profesionales. La persistencia en URL hace que cada vista sea compartible y marcable.

La vista de detalle completa con galería interactiva, selección de opciones y previsualización con IA integra perfectamente todas las capacidades del sistema en un flujo de usuario coherente. La transición suave del catálogo al detalle al probador virtual crea una experiencia sin fricciones.

El uso de TypeScript en toda la aplicación proporciona seguridad de tipos que previene clases enteras de bugs. Los errores de tipo se detectan en desarrollo, no en producción. Los IDEs proporcionan autocompletado preciso y refactoring seguro.

La infraestructura de testing con Jest y React Testing Library asegura que funcionalidad crítica permanezca funcional a medida que el código evoluciona. Los tests actúan como documentación viviente de cómo se espera que el código funcione.

El diseño responsivo móvil-primero con Tailwind CSS garantiza que la aplicación funcione bien en cualquier dispositivo. Con el creciente tráfico móvil en e-commerce, esta adaptabilidad es crucial para el éxito comercial.

Las optimizaciones de performance con Vite y memoización aseguran que la aplicación sea rápida. Los usuarios modernos esperan aplicaciones instantáneas, y cada segundo de demora reduce conversión.

### 9.3 Validación de Arquitectura Modular

La estructura de carpetas del proyecto valida físicamente la arquitectura modular. Los diferentes tipos de código viven en directorios separados y claramente nombrados. No hay archivos de "utilidades misceláneas" donde se amontona código que no encaja en ningún lugar.

Los path aliases configurados (`@/components`, `@/lib`, etc.) permiten imports limpios que son más fáciles de leer y refactorizar. Un import como `import { Button } from '@/components/ui/button'` es claro sobre qué se está importando y de dónde, sin importar desde qué nivel del árbol de directorios se esté importando.

Los custom hooks demuestran encapsulación efectiva de lógica. La lógica de obtención de productos vive en `useProducts`, no dispersa en múltiples componentes. Si necesitamos cambiar cómo se obtienen productos (quizás agregar caché más sofisticado), cambiamos un solo archivo.

El servicio API centralizado con interceptores significa que preocupaciones transversales como autenticación y manejo de errores se implementan una vez y se aplican consistentemente. No hay peticiones HTTP directas en componentes de UI.

El sistema de componentes UI completamente desacoplado de lógica de negocio significa que podríamos reemplazar Shadcn/UI con otro sistema de componentes sin tocar la lógica de productos, autenticación o filtrado. Esta separación es el test definitivo de buena modularidad.

Las interfaces TypeScript definen contratos claros entre módulos. Un componente que recibe props de tipo `Product` sabe exactamente qué campos están disponibles. Si el backend cambia el formato, TypeScript detecta inmediatamente dónde se requieren cambios en el frontend.

---

## ANEXO: COMANDOS DE VALIDACIÓN Y ANÁLISIS

Para validar empíricamente la arquitectura y estructura del proyecto, se pueden ejecutar varios comandos desde la terminal. El comando `tree frontend/src -L 2` visualiza la estructura de directorios hasta dos niveles de profundidad, revelando claramente la organización modular.

Para contar componentes por tipo, comandos como `find frontend/src/components/ui -name "*.tsx" | wc -l` cuentan exactamente 49 componentes UI, mientras que `find frontend/src/pages -name "*.tsx" | wc -l` cuenta las 13 páginas implementadas.

El comando `npm list --depth=0` muestra todas las dependencias de primer nivel del proyecto, útil para auditar qué librerías se están usando. Para verificar el uso de path aliases, `grep -r "@/" frontend/src --include="*.tsx" | head -20` muestra ejemplos de imports usando el alias `@/`.

Los comandos de testing y build (`npm run test`, `npm run test:coverage`, `npm run build`) validan que el código es correcto y se puede desplegar exitosamente. El análisis del tamaño del bundle con `ls -lh dist/assets` después de un build revela el tamaño de los archivos JavaScript y CSS finales.

---

**Fecha de Elaboración**: Octubre 2025  
**Proyecto**: Probador Virtual con IA - StyleAI  
**Tecnología Principal**: React 18 + TypeScript + Vite  
**Arquitectura**: Modular basada en separación de responsabilidades  
**Despliegue**: Vercel (https://probador-virtual-ecommerce.vercel.app/)
****