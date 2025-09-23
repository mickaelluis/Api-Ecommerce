import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// SDK do Mercado Pago
const mercadopago = require ('mercadopago');
// Adicione as credenciais
mercadopago.configure({
  access_token: `${process.env.MERCADO_PAGO_TOKEN}`
});

// Cria um objeto de preferência
const payment = {
MercadoPago: async (Dados: string) => {
      console.log("CHEGOUUU AQUIIIII", Dados )
let preference = {
  // o "purpose": "wallet_purchase" permite apenas pagamentos logados
  // para permitir pagamentos como guest, você pode omitir essa propriedade
  //"purpose": "wallet_purchase",
  "items": [
    {
      "id": "item-ID-1234",
      "title": "Meu produto",
      "quantity": 1,
      "unit_price": 75.76
    }
  ]
};
mercadopago.preferences.create(preference)
  .then(function (response: any) {
    // Este valor é o preferenceId que será enviado para o Brick na inicialização
    const preferenceId = response.body.id;
    return { status: 200, success: false, message: `Produto comprado com sucesso` };
  }).catch(function (error: any) {
    console.log(error);
  });
}
}

export default payment;