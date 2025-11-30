const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/ciompi';

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema de Usuario (coincide con models/Usuario.ts)
const usuarioSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: false, // Opcional según el modelo actual
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: '/avatars/default-avatar.png',
    },
    rol: {
      type: String,
      enum: ['Administrativo', 'Usuario'],
      default: 'Usuario',
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo',
    },
    cargo: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    usuarioCreacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    usuarioModificacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Crea createdAt y updatedAt automáticamente
    toJSON: {
      transform: function (doc, ret) {
        const { password, ...userWithoutPassword } = ret;
        return userWithoutPassword;
      },
    },
  }
);

// Middleware para actualizar fechaActualizacion
usuarioSchema.pre('save', function (next) {
  this.fechaActualizacion = new Date();
  next();
});

// Middleware para hashear contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Usuario =
  mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

async function resetUsuarios() {
  try {
    await connectDB();

    console.log('\n🗑️  Eliminando todos los usuarios existentes...');
    const deleteResult = await Usuario.deleteMany({});
    console.log(`✅ Eliminados ${deleteResult.deletedCount} usuarios\n`);

    console.log('👤 Creando nuevo usuario administrador...');

    // Crear usuario administrador
    const nuevoUsuario = new Usuario({
      usuario: 'admin',
      password: 'admin123', // Se hasheará automáticamente
      email: 'admin@ciompi.com',
      nombre: 'Administrador del Sistema',
      rol: 'Administrativo', // Usar el valor correcto del enum
      estado: 'activo',
      cargo: 'Administrador',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });

    await nuevoUsuario.save();

    console.log('✅ Usuario administrador creado exitosamente\n');
    console.log('📋 Datos del usuario:');
    console.log(`   Usuario: ${nuevoUsuario.usuario}`);
    console.log(`   Contraseña: admin123`);
    console.log(`   Email: ${nuevoUsuario.email}`);
    console.log(`   Nombre: ${nuevoUsuario.nombre}`);
    console.log(`   Rol: ${nuevoUsuario.rol}`);
    console.log(`   Estado: ${nuevoUsuario.estado}`);
    console.log(`   Cargo: ${nuevoUsuario.cargo || 'N/A'}`);
    console.log(`   Fecha Creación: ${nuevoUsuario.fechaCreacion}`);
    console.log(`   ID: ${nuevoUsuario._id}\n`);

    // Opcional: Crear un usuario de prueba adicional
    console.log('👤 Creando usuario de prueba...');
    const usuarioPrueba = new Usuario({
      usuario: 'usuario',
      password: 'usuario123',
      email: 'usuario@ciompi.com',
      nombre: 'Usuario de Prueba',
      rol: 'Usuario',
      estado: 'activo',
      cargo: 'Usuario',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });

    await usuarioPrueba.save();
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log(`   Usuario: ${usuarioPrueba.usuario}`);
    console.log(`   Contraseña: usuario123\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code === 11000) {
      console.error('⚠️  Error: Ya existe un usuario con ese nombre o email');
    }
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

resetUsuarios();
