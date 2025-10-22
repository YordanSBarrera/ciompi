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
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema de Usuario actualizado
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
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: '/avatars/default-avatar.png',
    },
    rol: {
      type: String,
      enum: ['admin', 'user', 'Administrativo', 'Usuario'],
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
    informacionContacto: {
      telefono: {
        type: String,
        trim: true,
        maxlength: 20,
      },
    },
    preferencias: {
      tema: {
        type: String,
        enum: ['claro', 'oscuro', 'sistema'],
        default: 'claro',
      },
      idioma: {
        type: String,
        default: 'es',
        maxlength: 10,
      },
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
    timestamps: true,
  }
);

// Middleware para hashear contraseña
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

const Usuario = mongoose.model('Usuario', usuarioSchema);

async function resetUsuarios() {
  try {
    await connectDB();

    console.log('🗑️ Eliminando todos los usuarios existentes...');
    const deleteResult = await Usuario.deleteMany({});
    console.log(`✅ Eliminados ${deleteResult.deletedCount} usuarios`);

    console.log('👤 Creando nuevo usuario administrador...');
    const nuevoUsuario = new Usuario({
      usuario: 'admin',
      password: 'admin123',
      email: 'admin@ciompi.com',
      nombre: 'Administrador del Sistema',
      rol: 'admin',
      estado: 'activo',
      cargo: 'Administrador',
      informacionContacto: {
        telefono: '+598 99 123 456',
      },
      preferencias: {
        tema: 'claro',
        idioma: 'es',
      },
    });

    await nuevoUsuario.save();
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📋 Datos del usuario:');
    console.log(`   Usuario: ${nuevoUsuario.usuario}`);
    console.log(`   Email: ${nuevoUsuario.email}`);
    console.log(`   Nombre: ${nuevoUsuario.nombre}`);
    console.log(`   Rol: ${nuevoUsuario.rol}`);
    console.log(`   Estado: ${nuevoUsuario.estado}`);
    console.log(`   Cargo: ${nuevoUsuario.cargo}`);
    console.log(`   Teléfono: ${nuevoUsuario.informacionContacto?.telefono}`);
    console.log(`   Tema: ${nuevoUsuario.preferencias?.tema}`);
    console.log(`   Idioma: ${nuevoUsuario.preferencias?.idioma}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

resetUsuarios();
