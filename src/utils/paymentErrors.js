const ERROR_MESSAGES = {
  cc_rejected_insufficient_amount: 'No tenés fondos suficientes en tu tarjeta.',
  insufficient_amount: 'No tenés fondos suficientes.',
  cc_rejected_bad_filled_card_number: 'El número de tarjeta es incorrecto.',
  cc_rejected_bad_filled_security_code: 'El código de seguridad (CVV) es incorrecto.',
  cc_rejected_bad_filled_date: 'La fecha de vencimiento es incorrecta.',
  cc_rejected_call_for_authorize: 'Necesitás llamar a tu banco para autorizar el pago.',
  cc_rejected_card_disabled: 'Tu tarjeta está deshabilitada. Activala o usá otra.',
  cc_rejected_high_risk: 'Tu banco rechazó el pago por motivos de seguridad.',
  cc_rejected_duplicated_payment: 'Ya realizaste un pago similar recientemente.',
  cc_rejected_card_type_not_allowed: 'Tu tarjeta no acepta este tipo de pagos.',
  rejected_by_bank: 'Tu banco rechazó el pago. Comunicate con ellos para más detalles.',
  account_money_not_available: 'No tenés saldo suficiente en tu cuenta de Mercado Pago.',
  cc_rejected_other_reason: 'Tu tarjeta fue rechazada. Intentá con otro medio de pago.',
}

export function getPaymentError(statusDetail) {
  if (!statusDetail) return 'No pudimos procesar tu pago. Intentá con otro medio de pago.'
  return ERROR_MESSAGES[statusDetail] ?? 'No pudimos procesar tu pago. Intentá con otro medio de pago.'
}
