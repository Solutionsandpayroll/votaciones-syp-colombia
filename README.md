# Sistema de Votación — S&P Colombia

Plataforma web de votación para las elecciones SST 2026 de S&P Colombia. Soporta **dos módulos de votación independientes**: COPASST y Comité de Convivencia Laboral. Garantiza un voto individual, secreto e irrepetible por trabajador por módulo. Desarrollada con React + Vercel + Neon PostgreSQL.

## Módulos de Votación

| Módulo | Candidatos |
|---|---|
| **COPASST** | Tatiana Chavarro, Yina Vega, Yeferson Pineda, Felipe Jimenez, Voto en Blanco |
| **Convivencia Laboral** | Yuly Peña, Ana Maria Gutierrez, Viviana Guzman, Dayan Manjarres, Voto en Blanco |

> Un mismo trabajador puede votar en los dos módulos, pero solo una vez por módulo.

## Características

- Pantalla de inicio con selección de módulo (COPASST o Convivencia Laboral)
- Autenticación por nombre de trabajador (lista predefinida de 54 personas)
- Verificación en tiempo real — bloquea el acceso si el trabajador ya votó en ese módulo
- Voto secreto garantizado por diseño de base de datos (dos tablas sin relación entre sí)
- Prevención de voto duplicado validada del lado del servidor
- Resultados en tiempo real con actualización cada 10 segundos
- Panel de resultados con tabs para alternar entre módulos
- Página de resultados protegida con contraseña de administrador
- Exportación de resultados a PDF directamente desde el navegador
- Diseño responsivo — funciona en escritorio y móvil

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router 6 |
| Hosting | Vercel |
| Base de datos | Neon PostgreSQL |
| API / Backend | Vercel Serverless Functions (`api/`) |
| Código fuente | GitHub |

## Estructura del Proyecto

```
.
├── api/                      # Serverless functions (ejecutadas en Vercel)
│   ├── check-voter.js        # Verifica si un trabajador ya votó en el módulo
│   ├── vote.js               # Registra el voto (atómico: votante + contador)
│   ├── results.js            # Devuelve resultados filtrados por módulo
│   └── history.js            # Devuelve historial de participantes por módulo
│
├── src/
│   ├── components/           # Componentes reutilizables (Card, CandidateCard...)
│   ├── config/
│   │   └── neonApi.js        # Cliente frontend que llama a /api/*
│   ├── context/
│   │   └── VotingContext.jsx # Estado global: módulo activo, sesión de voto
│   ├── data/
│   │   ├── candidates.js     # Candidatos de COPASST y Convivencia Laboral
│   │   └── employees.js      # Lista de 54 trabajadores autorizados
│   ├── pages/
│   │   ├── Home.jsx          # Selector de módulo (pantalla inicial)
│   │   ├── Login.jsx         # Selección de trabajador
│   │   ├── Voting.jsx        # Pantalla de selección de candidato
│   │   ├── Confirmation.jsx  # Confirmación del voto
│   │   └── Results.jsx       # Dashboard de resultados con tabs por módulo
│   └── main.jsx
│
├── public/                   # Fotos de candidatos y assets estáticos
├── vercel.json               # Configuración de rutas Vercel
├── .env                      # Variables de entorno locales (NO en git)
└── index.html
```

## Variables de Entorno

Crea un archivo `.env` en la raíz (ver `.env.example`):

```env
# Conexión a Neon PostgreSQL — solo disponible en el servidor (nunca llega al navegador)
DATABASE_URL=postgresql://...

# Contraseña para acceder a la página de resultados
VITE_RESULTS_PASSWORD=tu_contraseña_segura
```

> `DATABASE_URL` **nunca** se expone al navegador. Solo la usan las funciones serverless en `api/`.

## Instalación y Desarrollo Local

```bash
# Instalar dependencias
npm install

# Instalar Vercel CLI (una sola vez)
npm install -g vercel

# Iniciar servidor local con soporte completo de API
vercel dev
```

> Usar `vercel dev` en lugar de `npm run dev`. Con solo Vite las rutas `/api/*` devuelven 404 porque son serverless functions que solo Vercel sabe ejecutar.

## Base de Datos — Esquema

Dos tablas en Neon PostgreSQL, sin ninguna relación entre ellas (garantía de anonimidad). Ambas incluyen `tipo_votacion` para separar los módulos:

```sql
-- Registra quién participó (sin indicar por quién votó)
CREATE TABLE votantes (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  tipo_votacion  TEXT NOT NULL CHECK (tipo_votacion IN ('copasst', 'convivencia')),
  fecha_hora     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nombre, tipo_votacion)
);

-- Cuenta votos por candidato (sin identificar al votante)
CREATE TABLE resultados (
  candidato_id     INTEGER NOT NULL,
  tipo_votacion    TEXT NOT NULL CHECK (tipo_votacion IN ('copasst', 'convivencia')),
  candidato_nombre TEXT NOT NULL,
  total_votos      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (candidato_id, tipo_votacion)
);
```

## Flujo de Votación

1. El trabajador entra y **selecciona el módulo** (COPASST o Convivencia Laboral).
2. Selecciona su nombre de la lista de empleados.
3. El sistema consulta `/api/check-voter` con el nombre y el módulo — si ya votó en ese módulo, bloquea el acceso.
4. El trabajador elige su candidato y confirma.
5. `/api/vote` inserta el nombre en `votantes` e incrementa el contador en `resultados`, ambos con `tipo_votacion`.
6. El trabajador ve la pantalla de confirmación. El acceso a ese módulo queda bloqueado definitivamente.

## Resultados

El administrador accede desde la pantalla de inicio usando la contraseña configurada en `VITE_RESULTS_PASSWORD`. La vista muestra:

- **Tabs** para alternar entre resultados de COPASST y Convivencia Laboral
- Votos y porcentaje por candidato en cada módulo
- Historial de trabajadores que participaron (sin indicar su voto)
- Botón para exportar a PDF

## Despliegue en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en el panel de Vercel:
   - `DATABASE_URL` (sin prefijo `VITE_`) — connection string de Neon
   - `VITE_RESULTS_PASSWORD` — contraseña del administrador
3. Vercel desplegará automáticamente en cada `git push` a `main`.
