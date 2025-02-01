import bcrypt from 'bcryptjs'

(async () => {
  const password = "123"; // The password you're testing
  const storedHash = "$2a$10$bgelrJaGYvSbcn3rHr4fd.XHM.cFBFxyPUv1TQ5OHjgXv2Wc5s9tu"; // The hash in your DB

  const match = await bcrypt.compare(password, storedHash);
  console.log("Password Match:", match);
})();
