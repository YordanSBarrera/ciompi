const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema del usuario (simplificado para el script)
const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  avatar: { type: String, default: '/avatars/default-avatar.png' },
  rol: { type: String, enum: ['admin', 'user'], default: 'user' },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

async function createAdminUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ciompi'
    );
    console.log('Conectado a MongoDB');

    // Verificar si ya existe el usuario admin
    const existingAdmin = await Usuario.findOne({ usuario: 'admin' });
    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      process.exit(0);
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Crear usuario admin
    const adminUser = new Usuario({
      usuario: 'admin',
      password: hashedPassword,
      email: 'admin@ciompi.com',
      nombre: 'Administrador',
      avatar: '/avatars/default-avatar.png',
      rol: 'admin',
      estado: 'activo',
      fechaCreacion: new Date('2024-01-01T00:00:00.000Z'),
      fechaActualizacion: new Date('2024-01-01T00:00:00.000Z'),
    });

    await adminUser.save();
    console.log('Usuario admin creado exitosamente');
    console.log('Credenciales:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
  } catch (error) {
    console.error('Error creando usuario admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();
