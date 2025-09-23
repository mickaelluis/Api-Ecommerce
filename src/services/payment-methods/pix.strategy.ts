// Importa a classe de configuração do SDK
import { Payment, MercadoPagoConfig } from 'mercadopago';
require("dotenv").config();
const token = process.env.MERCADO_PAGO_TOKEN;
const key = process.env.MERCADO_PAGO_KAY;

// 1. Configuração do Cliente (como visto anteriormente)
const client = new MercadoPagoConfig({ accessToken: `${token}` });
const payment = new Payment(client);

class PixStrategy {
  // 1. Transformamos o método em "async"
  async processar() {
        payment.create({
  body: {
    additional_info: {
      items: [
        {
          id: 'MLB2907679857',
          title: 'Point Mini',
          description: 'Point product for card payments via Bluetooth.',
          picture_url: 'https://http2.mlstatic.com/resources/frontend/statics/growth-sellers-landings/device-mlb-point-i_medium2x.png',
          category_id: 'electronics',
          quantity: 1,
          unit_price: 58,
        }
      ],
      payer: {
        first_name: 'Test',
        last_name: 'Test',
        phone: {
          area_code: '11',
          number: '987654321'
        },
        address: {
          street_number: null 
        }
      },
      shipments: {
        receiver_address: {
          zip_code: '12312-123',
          state_name: 'Rio de Janeiro',
          city_name: 'Buzios',
          street_name: 'Av das Nacoes Unidas',
          street_number: 3003
        }
      }
    },
    application_fee: null,
    binary_mode: false,
    campaign_id: null,
    capture: false,
    coupon_amount: null,
    description: 'Payment for product',
    differential_pricing_id: null,
    external_reference: 'MP0001',
    installments: 1,
    metadata: null,
    payer: {
      entity_type: 'individual',
      type: 'customer',
      email: 'test_user_123@testuser.com',
      identification: {
        type: 'CPF',
        number: '95749019047'
      }
    },
    payment_method_id: 'master',
    token: 'ff8080814c11e237014c1ff593b57b4d',
    transaction_amount: 58
  },
  requestOptions: { idempotencyKey: '<SOME_UNIQUE_VALUE>' }
})
    } 
}
export default PixStrategy;
