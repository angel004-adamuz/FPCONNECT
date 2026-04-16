import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';

const SALT_ROUNDS = 10;

const [email, recoveryQuestion, recoveryAnswer, newPassword] = process.argv.slice(2);

if (!email || !recoveryQuestion || !recoveryAnswer) {
  console.error('Uso: npm run admin:set-recovery -- <email> "<pregunta>" "<respuesta>" ["<nuevaPassword>"]');
  process.exit(1);
}

const normalize = (value) => value.trim().toLowerCase();

const run = async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      console.error(`Usuario no encontrado: ${email}`);
      process.exit(1);
    }

    const recoveryAnswerHash = await bcrypt.hash(normalize(recoveryAnswer), SALT_ROUNDS);
    const data = {
      recoveryQuestion,
      recoveryAnswerHash,
      recoveryUpdatedAt: new Date(),
    };

    if (newPassword) {
      data.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    console.log(`Recuperacion configurada para ${email}`);
    if (newPassword) {
      console.log('Se actualizo tambien la contrasena.');
    }
  } catch (error) {
    console.error('Error al configurar recuperacion:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

run();
