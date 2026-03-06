# TP_DSW_FrontEnd
Este proyecto corresponde al frontend para el trabajo de desarrollo de una aplicacion web full-stack para la materia de **Desarrollo de Software** de 3er año de 
la carrera de Ingeniería en Sistemas de Información en la [Universidad Tecnológica Nacional Regional Rosario](https://www.frro.utn.edu.ar/)

En el siguiente link se encuentra la propuesta de la aplicación a desarrollar: [proposal.md](https://github.com/Tomas-Wardoloff/tp/blob/main/proposal.md)

## Instalación
1. Clona el repositorio 
```sh
    git clone https://github.com/luciomondelli/TP_DSW_FrontEnd.git
    cd TP_DSW_FrontEnd
```
2. Instala las dependencias
```sh
    pnpm install | npm install
```
3. Inicia la aplicación 
```sh
    pnpm run dev | npm run dev
```
4. Accede a la aplicacion, navegando a la ruta `http://localhost:5173` en tu navegador

## Uso
Para ejecutar el proyecto, primero asegúrate de tener el backend corriendo. Con el comando:
```sh
    docker-compose up -d
```
Y luego ejecuta el siguiente comando en la terminal para iniciar la aplicación en modo desarrollo:
```sh
    pnpm run dev | npm run dev
```
Este comando iniciará el servidor de desarrollo de Vite, recargando automáticamente cuando se realicen cambios en el código.

## Integrantes
* 51754 - [Mondelli, Lucio](https://github.com/luciomondelli)
* 51497 - [Plenza, Liam](https://github.com/LiamPlenza)
* 51543 - [Wardoloff, Tomas](https://github.com/Tomas-Wardoloff)
