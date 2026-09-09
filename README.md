# Balance — control de peso, comida y ejercicio

Aplicación web (React + TypeScript + Vite) para perder peso de forma
sostenida: registra lo que comes y el ejercicio que haces, busca calorías y
recetas en fuentes de datos públicas de internet, y recibe una
recomendación diaria para mantenerte en déficit calórico (o en
mantenimiento una vez alcanzas tu peso objetivo).

## Funcionalidades

- **Perfil**: sexo, edad, altura, peso, nivel de actividad y objetivo
  (perder / mantener / ganar peso), con un ritmo semanal configurable.
- **Cálculo automático**: BMR (fórmula Mifflin-St Jeor), TDEE (gasto
  calórico total según actividad) y un objetivo diario de calorías acorde
  al déficit/superávit deseado (con límites de seguridad).
- **Comida**: busca alimentos y sus calorías por 100 g en
  [Open Food Facts](https://world.openfoodfacts.org) (API pública, sin
  clave) y añádelos a tu registro diario con la cantidad en gramos.
- **Recetas**: busca recetas con ingredientes y modo de preparación en
  [TheMealDB](https://www.themealdb.com/api.php) (API pública, sin clave).
- **Ejercicio**: busca ejercicios en la base de datos pública de
  [wger.de](https://wger.de/api/v2/) y registra la duración; las calorías
  quemadas se estiman con el método MET estándar
  (`kcal = MET × peso(kg) × horas`) usando tu peso actual. También hay una
  lista rápida con una tabla MET local para cuando no hay conexión.
- **Progreso**: registra tu peso a lo largo del tiempo y visualiza la
  tendencia frente a tu objetivo en un gráfico.
- **Recomendación diaria**: compara tus calorías netas (consumidas menos
  quemadas) contra tu objetivo y te da consejos concretos; cuando alcanzas
  tu peso objetivo, cambia automáticamente a consejos de mantenimiento.

Todos los datos (perfil, registros de comida/ejercicio/peso) se guardan en
el `localStorage` del navegador — no hay backend ni cuenta de usuario.

## Fuentes de datos externas

| Fuente | Uso | Requiere clave |
| --- | --- | --- |
| Open Food Facts | Calorías por alimento | No |
| TheMealDB | Recetas e instrucciones de cocina | No |
| wger.de | Nombres/categorías de ejercicios | No |

Estas tres APIs son públicas y gratuitas. Si tu red bloquea alguno de estos
dominios, la app lo indica con un mensaje de error y sigue funcionando con
la tabla MET local para ejercicio y la entrada manual para comidas.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (incluye chequeo de tipos)
npm run preview  # sirve el build de producción localmente
```
