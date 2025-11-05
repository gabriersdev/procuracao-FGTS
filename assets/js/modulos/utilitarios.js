const isEmpty = (valor) => {
  if (typeof valor === 'string') {
    return valor === undefined || valor === null || valor.length <= 0;
  } 
  if (Array.isArray(valor)) {
    return valor.length <= 0;
  } 
  if (typeof valor === 'object') {
    return Object.keys(valor).length <= 0;
  }
  return valor === undefined || valor === null;
};

function verifyCPF(cpf) {
  let result = false;
  const newCPF = cpf.replace(/\D/g, '');
  
  switch (cpf) {
    case '00000000000':
    case '11111111111':
    case '22222222222':
    case '33333333333':
    case '44444444444':
    case '55555555555':
    case '66666666666':
    case '77777777777':
    case '88888888888':
    case '99999999999':
      return false;
    default: 
      if (newCPF.toString().length !== 11 || /^(\d)\1{10}$/.test(newCPF)) return false;
      result = true;
      [9, 10].forEach((j) => {
        let sum = 0; 
        let r;
        newCPF.split(/(?=)/).splice(0, j).forEach((e, i) => {
          sum += parseInt(e, 10) * ((j + 2) - (i + 1));
        });
        r = sum % 11;
        r = (r < 2) ? 0 : 11 - r;
        if (r !== parseInt(newCPF.substring(j, j + 1), 10)) result = false;
      });
  }
  
  return result;
}

function zeroLeft(quantity, value) {
  let zeros = '';

  for (let i = 0; i < quantity; i += 1) {
    zeros += '0';
  }

  return (zeros + value).slice(-quantity);
}

export {
  isEmpty,
  verifyCPF,
  zeroLeft,
};
