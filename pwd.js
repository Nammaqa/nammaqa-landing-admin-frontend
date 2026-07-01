import bcrypt from 'bcrypt';

   const hashedPassword = await bcrypt.hash('nammaqaprod@123', 10);
   console.log('Hashed Password:', hashedPassword);