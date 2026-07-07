/**
 * Validador de Identificación Dominicana (Cédula y RNC)
 */

export function validarCedula(cedula: string): boolean {
  const clean = cedula.replace(/[^0-9]/g, "")
  if (clean.length !== 11) return false

  let sum = 0
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]

  for (let i = 0; i < 10; i++) {
    let val = parseInt(clean.charAt(i), 10) * weights[i]
    if (val >= 10) {
      val = Math.floor(val / 10) + (val % 10)
    }
    sum += val
  }

  const checkDigit = parseInt(clean.charAt(10), 10)
  const computedCheck = (10 - (sum % 10)) % 10

  return checkDigit === computedCheck
}

export function validarRNC(rnc: string): boolean {
  const clean = rnc.replace(/[^0-9]/g, "")
  if (clean.length !== 9) return false

  const weights = [7, 9, 8, 6, 5, 4, 3, 2]
  let sum = 0

  for (let i = 0; i < 8; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights[i]
  }

  const remainder = sum % 11
  let checkDigit = 0

  if (remainder === 0) {
    checkDigit = 2
  } else if (remainder === 1) {
    checkDigit = 1
  } else {
    checkDigit = 11 - remainder
  }

  return parseInt(clean.charAt(8), 10) === checkDigit
}

export function validarDocumentoIdentidad(doc: string): boolean {
  const clean = doc.replace(/[^0-9]/g, "")
  if (clean.length === 11) {
    return validarCedula(clean)
  } else if (clean.length === 9) {
    return validarRNC(clean)
  }
  return false
}
