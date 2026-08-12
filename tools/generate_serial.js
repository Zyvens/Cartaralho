const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, 'secret_private_key.pem');

if (!fs.existsSync(privateKeyPath)) {
  console.error('Chave privada não encontrada! Execute "node tools/keygen.js" primeiro.');
  process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const hardwareId = process.argv[2];

if (!hardwareId) {
  console.log(`
Uso: node generate_serial.js <CÓDIGO_DA_MÁQUINA>
Exemplo: node generate_serial.js 8A7B-9X2P
`);
  process.exit(1);
}

// Assinar o Hardware ID
const sign = crypto.createSign('SHA256');
sign.update(hardwareId);
sign.end();
const signature = sign.sign(privateKey, 'base64');

// O serial final é simplesmente a assinatura base64
console.log('\n======================================================');
console.log('✅ SERIAL GERADO COM SUCESSO');
console.log('Envie o texto abaixo para o usuário (ele deve copiar e colar no jogo):');
console.log('------------------------------------------------------\n');
console.log(signature);
console.log('\n======================================================\n');
