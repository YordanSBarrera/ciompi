## logica del negocio.

---> Hay 6 Módulos + 2 extra
-Financiamientos (módulo principal)
-Clientes
-Vehículos
-Empresas
-Usuarios
-Operaciones

++Extras++
.Operaciones
.Datos Generales
-<<<

## Descripción de funcionamiento de los módulos.

---> Clientes y Vehículos

- El módulo Cliente y Vehículo no estan asociado a ninguna Empresa.
- Una vez asociado tanto un Cliente como un Vehículo a un Financiamiento, este Cliente o Vehículo no se puede Borrar de la BD.

-<<<

---> Financiamiento

- Los Financiamientos estan asociados a una Empresa
- Los Financiamintos antes de estar en estado FINALIZADO pueden ser cambiados de Empresa.
- Se pueden editar, cancelar.
- -<<<

  ---> Operaciones

- Modulos para realizar busqueda de datos importante.
- Todas las operaciones son en base a una Empresa. (todos los datos acá mostrados son de una empresa en específico)
- -<<<

  ---> Usuarios

- Gestion de Usuarios.
- Roles de Usuarios (Administrativo, Usuario)
  - Rol Administrativo: tiene acceso total y hacer todas las acciones.
  - Rol Usuario: acceso restringido. No puede Borrar ni Editar, no puede crear nuevos usuarios, puede editar solo a su propio usuario. Puede editar Clientes y Vehículos, no Empresas.

-<<<
