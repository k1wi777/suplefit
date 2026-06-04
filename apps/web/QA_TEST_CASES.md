# QA Test Cases - SupleFit Frontend

Este documento contiene una lista de pruebas manuales sugeridas para validar la correcta funcionalidad de las rutas protegidas, la autenticación y la consistencia visual en el frontend del prototipo SupleFit.

## Módulo: Autenticación y Autorización

### Caso 1: Protección de rutas privadas (Usuario No Autenticado)
*   **Precondición:** El usuario NO ha iniciado sesión (no hay token en cookies/localStorage).
*   **Acción:** 
    1. Intentar acceder manualmente por URL a `/dashboard`
    2. Intentar acceder a `/profile`
    3. Intentar acceder a `/admin`
    4. Intentar acceder a `/performance`
    5. Intentar acceder a `/recovery`
*   **Resultado esperado:**
    *   En todos los casos, el sistema debe redirigir automáticamente a `/login`.
    *   La URL de destino debe contener un parámetro `next` (ej: `/login?next=%2Fdashboard`), de modo que, si el usuario se loguea en ese momento, sea devuelto a la ruta que intentaba visitar.

### Caso 2: Restricción de rutas de invitados (Usuario Autenticado)
*   **Precondición:** El usuario ha iniciado sesión exitosamente.
*   **Acción:**
    1. Intentar acceder manualmente por URL a `/login`.
    2. Intentar acceder manualmente por URL a `/register`.
*   **Resultado esperado:**
    *   El sistema debe redirigir automáticamente a `/dashboard`. El componente `GuestOnly` evita que usuarios logueados vean pantallas de entrada.

### Caso 3: Cierre de Sesión (Logout)
*   **Precondición:** El usuario ha iniciado sesión y se encuentra en `/dashboard`.
*   **Acción:**
    1. Hacer clic en el botón "Cerrar sesión" en la barra de navegación (NavBar).
*   **Resultado esperado:**
    *   El token (cookie y localStorage) debe ser eliminado.
    *   El usuario debe ser redirigido a `/login`.
    *   Si el usuario intenta usar el botón "Atrás" de su navegador para volver a `/dashboard`, debe ser redirigido nuevamente al login.

---

## Módulo: Interfaz Visual (Estilo iOS / Glassmorphism)

### Caso 4: Consistencia visual del Layout
*   **Precondición:** Navegar por cualquier vista principal (`/`, `/catalog`, `/dashboard`, etc).
*   **Acción:** Observar el diseño de fondo y tarjetas.
*   **Resultado esperado:**
    *   Fondo oscuro general (`--background: #0a0a0a` en `globals.css`).
    *   Elementos (tarjetas, panels) utilizando colores translúcidos (`background: rgba(255, 255, 255, 0.06)`, `backdrop-filter: blur(14px)`).
    *   Detalles de neón, acento verde lima (`#baff2e`) en detalles o botones importantes (usando `neon-btn` / `neon-text`).
    *   En tarjetas interactuables, debe haber un pequeño salto (`transform: translateY(-4px)`) y ligero resaltado al pasar el ratón (hover) gracias a `card-hover`.

### Caso 5: Vistas laterales (Performance y Recovery)
*   **Precondición:** El usuario ha iniciado sesión.
*   **Acción:**
    1. Navegar a `/performance`.
    2. Navegar a `/recovery`.
*   **Resultado esperado:**
    *   Ambas vistas deben dividirse en un layout tipo _Sidebar_ (a la izquierda) y _Content_ (a la derecha).
    *   El Sidebar debe contener los enlaces a "Dashboard", "Performance", "Recovery" e "Settings".
    *   La página activa en el Sidebar debe tener un resaltado de color (`texto emerald/sky` + `fondo semitransparente`).

---

## Módulo: Integración (Datos)

### Caso 6: Visibilidad Panel de Admin
*   **Precondición:**
    1. Iniciar sesión con un usuario que **NO** es administrador.
    2. Iniciar sesión con un usuario que **SÍ** es administrador (`isAdmin = true` en base de datos).
*   **Acción:** Observar el `NavBar` en ambos casos.
*   **Resultado esperado:**
    *   El usuario regular **NO** debe ver la opción "Admin" en la barra superior.
    *   Al usuario regular se le debe bloquear al intentar acceder a `/admin` mediante URL (idealmente si el middleware hace check del rol en servidor) o devolver error de API.
    *   El usuario administrador **SÍ** debe ver la opción "Admin".

### Caso 7: Filtro en el Catálogo
*   **Precondición:** Ir a `/catalog`.
*   **Acción:**
    1. Escribir texto en el campo de búsqueda ("Creatina" u otro) y presionar enter / buscar.
    2. Hacer clic sobre los botones tipo "píldora" de las categorías (ej: "Whey Protein").
*   **Resultado esperado:**
    *   La lista de tarjetas (`GlassCard` con imagen) debe filtrarse dinámicamente según se haga la consulta contra `/api/supplements`.
    *   Si no hay resultados, debe mostrarse el mensaje textual "Sin resultados".