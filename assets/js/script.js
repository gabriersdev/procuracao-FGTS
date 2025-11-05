import {isEmpty, verificarCPF, zeroEsquerda} from './modulos/utilitarios.js';
import Forms from "./classes/Forms.js";

// TODO - refatorar e remover código não usado, padronizar atributos id e nome de variáveis em inglês e em camel case
(() => {
  const MODE = 0;
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (e) {
    console.log(e);
  }
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (error) {
    console.log('Um erro ocorreu. Erro: %s', error);
  }
  
  function showModalEditInfos() {
    document.querySelector('#modal-editar-informacoes').showModal();
    setTimeout(() => {
      document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
    }, 0);
  }
  
  function send(form) {
    form = document.querySelector(`form[data-action="${form.dataset.action}"]`)
    console.log(form);
    
    let inputs = Array.from(document.querySelectorAll('input')).map(e => e.dataset.input);
    inputs = inputs.filter(e => e);
    
    const formData = Array.from(inputs.map(i => [i, form.querySelector(`[data-input="${i}"]`).value]));
    let itsAllOk = true;
    // TODO - fazer validação de CNPJ e cName
    const CNPJ = formData.find(f => f[0] === "rs_id");
    const cName = formData.find(f => f[0] === "rs_cca");
    const city = formData.find(f => f[0] === "cidade");
    const signDate = formData.find(f => f[0] === "data");
    
    if (signDate[1]) {
      const date = new Date(`${signDate[1]}T00:00:00-03:00`)
      if (date == "Invalid Date") {
        alert("A data de assinatura não é válida!")
        itsAllOk = false;
        return;
      } else if (date.getFullYear() !== new Date().getFullYear()) {
        if (!confirm("O ano na data de assinatura é diferente do ano atual, informado pelo seu navegador.")) {
          itsAllOk = false;
          return;
        }
      } else if (date.getMonth() !== new Date().getMonth()) {
        if (!confirm("O mês na data de assinatura é diferente do mês atual, informado pelo seu navegador.")) {
          itsAllOk = false;
          return;
        }
      }
    }
    
    if (city[1] && signDate[1]) {
      const date = new Date(`${signDate[1]}T00:00:00-03:00`)
      formData.push(["date_full", `${city[1]}, ${('0' + date.getDate()).slice(-2)} de ${date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      })}`])
    } else {
      alert("Faltou preencher a cidade ou a data de assinatura!")
      itsAllOk = false;
      return;
    }
    
    formData.toSorted((a, b) => a[0].localeCompare(b[0])).filter(f => f[0].match(/CPF_\d/g)).forEach((prop, index) => {
      if (prop[1]) {
        if (verificarCPF(prop[1])) formData.push([`prop_${index + 1}`, 'X']);
        else {
          alert("O CPF está inválido!");
          itsAllOk = false;
          return false;
        }
      } else formData.push([`prop_${index + 1}`, '  ']);
    });
    
    if (itsAllOk) {
      formData.forEach((form) => {
        console.log(form);
        const referEl = document.querySelector(`[data-refer="${form[0]}"]`);
        if (referEl) {
          if (form[0] === "data") {
            const date = new Date(form[1]);
            referEl.textContent = `${('0' + date.getDate()).slice(-2)} de ${date.toLocaleString("pt-BR", {month: "long"})} de ${date.getFullYear()}`;
          } else referEl.textContent = form[1];
        }
      });
      
      document.querySelector("#modal-editar-informacoes").close();
      
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }
  
  function attributeActions() {
    const acoes = document.querySelectorAll('[data-action]');
    
    acoes.forEach((action) => {
      switch (action.dataset.action) {
        case "clear-all-ls":
          $(action).on("click", (event) => {
            event.preventDefault();
            if (confirm("Você tem certeza que deseja apagar todos os formulário armazenados? Isso é irreversível.")) {
              const formsInst = new Forms();
              formsInst.clearAll();
              window.location.reload();
            }
          })
          break;
        
        case 'acao':
          break;
        
        case 'editar':
          try {
            $(action).on('click', (event) => {
              event.preventDefault();
              document.querySelector('#modal-editar-informacoes').showModal();
              setTimeout(() => {
                document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
              }, 0);
            });
          } catch (error) {
            console.log('Um erro ocorreu. Erro: %s', error);
          }
          break;
        
        case 'fechar-modal':
          $(action).on('click', (event) => {
            event.preventDefault();
            (action.closest('dialog')).close();
          });
          break;
        
        case 'formulario-editar-informacoes':
          $(action).on('submit', (event) => {
            event.preventDefault();
            send(event.target);
          });
          break;
        
        case 'update-sign-date':
          $(action).on("click", () => {
            const now = new Date();
            $("#data").val(`${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)}`);
            if (new Date($("#data").val()) == "Invalid Date") {
              $("#data").val("");
              alert("Não foi possível atualizar a data de assinatura para a data atual. Atualize manualmente.");
            }
          });
          break;
        
        default:
          console.warn('A ação não foi implementada.');
          break;
      }
    });
  }
  
  function attributeMask(param, input) {
    if (isEmpty(param) && isEmpty(input)) {
      document.querySelectorAll('[data-mascara]').forEach((input) => {
        switch (input.dataset.mascara.trim().toLowerCase()) {
          case 'cpf':
            $(input).mask('000.000.000-00');
            $(input).on('input', (evento) => {
              if (verificarCPF(evento.target.value)) {
                $(evento.target.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeOut(500);
              } else {
                $(evento.target.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeIn(500);
              }
            });
            break;
          
          case 'cnpj':
            $(input).mask('00.000.000/0000-00');
            $(input).val('20.222.637/0001-30');
            break;
          
          default:
            throw new Error('Ação não implementada para o link informado.');
        }
      });
    } else {
      switch (param.toLowerCase().trim()) {
        case 'cpf':
          $(input).mask('000.000.000-00', {reverse: true});
          break;
        
        default:
          break
      }
    }
  }
  
  const verifyValuesInParams = () => {
    try {
      const url = new URLSearchParams(window.location.search);
      const paramsInsert = Array.from(document.querySelectorAll('sxs[refer]')).map((sxs) => sxs.getAttribute('refer'));
      const manipulateParams = paramsInsert;
      
      let urlKeys = []
      
      for (let u of url.entries()) {
        urlKeys.push(u[0])
      }
      
      if (!urlKeys.find(k => paramsInsert.map(p => p.toLowerCase()).includes(k.toLowerCase()))) return;
      
      if (!isEmpty(paramsInsert) && url.size > 0) {
        paramsInsert.forEach((param) => {
          if (url.has(param) && !isEmpty(url.get(param))) {
            const element = document.querySelector(`[data-input=${param}]`);
            const {type} = element;
            
            switch (type) {
              case 'text':
                if (manipulateParams.includes(param)) {
                  switch (param) {
                    case 'CPF_1':
                      element.value = url.get(param).replace(/\D/g, '').substring(0, 11) || '';
                      attributeMask('cpf', element);
                      if (verificarCPF(element.value)) $(element.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeOut(500);
                      else $(element.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeIn(500);
                      break;
                  }
                } else element.value = url.get(param).replaceAll('-', ' ');
                break;
            }
          }
        });
        
        send(document.querySelector("form[data-action='formulario-editar-informacoes']"));
        
        // Clicando no botão de impressão
        setTimeout(() => {
          document.querySelector('.btn-impressao').click();
        }, 500);
      }
    } catch (error) {
      console.log('Ocorreu um erro ao tentar recuperar os dados da URL. Erro: %s', error);
    }
  }
  
  const beforePrint = () => {
    $('#controle').hide();
  };
  
  const afterPrint = () => {
    $('#controle').show();
  };
  
  window.addEventListener('load', () => {
    $('.overlay').hide();
    attributeActions();
    attributeMask();
    verifyValuesInParams();
    
    $('input').each((index, input) => {
      input.setAttribute('autocomplete', 'off');
    });
    
    $('input[type=checkbox],input[type=radio]').each((index, input) => {
      $(input).on('focus', () => {
        $(input.closest('.form-group')).addClass('focus');
      });
      
      $(input).on('blur', () => {
        $(input.closest('.form-group')).removeClass('focus');
      });
    });
    
    try {
      const moment = new Date();
      $('#data').val(`${moment.getFullYear()}-${zeroEsquerda(2, moment.getMonth() + 1)}-${zeroEsquerda(2, moment.getDate())}`);
    } catch (error) {
      console.log('Um erro ocorreu. Erro: %s', error);
    }
    
    $('.btn-impressao').on('click', (event) => {
      event.preventDefault();
      window.print();
    });
  });
  
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    
    mediaQueryList.addEventListener('change', (event) => {
      if (event.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }
  
  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;
  
  // Ativar modal editar informações
  document.addEventListener('keyup', (evento) => {
    if (!isEmpty(evento.keyCode)) {
      if (evento.keyCode === 45) {
        showModalEditInfos();
      }
    }
  });
  
  console.log(`Mode: ${MODE === 1 ? "Production" : "Development"}`, `Origin: ${window.location.origin}`, `Started: ${new Date()}`)
})();
