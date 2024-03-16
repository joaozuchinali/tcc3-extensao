const defaultReturnObject = {
    error: false,
    message: 'no-error'
};

// Verifica se é um valor truth do js
function _isTruth(value, truth = true) {
    const val = {...defaultReturnObject};

    if(
        (!value && truth) 
        || 
        (value && !truth)
    ) {
        val.error = true;
        val.message = 'not-truth'
    }

    return val;
}

// Verifica se apresenta um tamanho mínimo
function _minLength(value, min) {
    const val = {...defaultReturnObject};

    if(String(value).length < min) {
        val.error = true;
        val.message = 'less-than-min-length';
    }

    return val;
}

// Verifica se apresenta um tamanho máximo
function _maxLength(value, max) {
    const val = {...defaultReturnObject};
    
    if(String(value).length > max) {
        val.error = true;
        val.message = 'more-than-max-length';
    }

    return val;
}

// Verifica se é um valor com apenas números
function _isNumber(value, is = true) {
    const val = {...defaultReturnObject};

    if(
        (isNaN(Number(String(value))) && is == true)
        ||
        (!isNaN(Number(String(value))) && is == false)
    ) {
        val.error = true;
        val.message = 'not-number';
    }

    return val;
}

// Verifica se é um valor com apenas letras
function _isChar(value, is = true) {
    const val = {...defaultReturnObject};

    if(
        (Array.isArray(String(value).match(/[^a-zA-Z]/g)) && is == true)
        ||
        (!Array.isArray(String(value).match(/[^a-zA-Z]/g)) && is == false)
    ) {
        val.error = true;
        val.message = 'not-char';
    }

    return val;
}

// Hahsmpa com as configurações
const Configuration = {
    isTruth: _isTruth,
    minLength: _minLength,
    maxLength: _maxLength,
    isNumber: _isNumber,
    isChar: _isChar
}

// Montador de mensagens de erro
function fielNameExtractor(configs) {
    const field = configs.isField ? ` para o campo ${configs.fieldName}` : '';
    return field;
}
const DynamicMessages = {
    'not-truth': (configs) => {
        return `Valor inválido${fielNameExtractor(configs)}!`;
    },
    'less-than-min-length': (configs) => {
        return `Tamanho mínimo de ${configs.minLength} dígitos não alcançados${fielNameExtractor(configs)}!`;
    },
    'more-than-max-length': (configs) => {
        return `Tamanho máximo de ${configs.maxLength} dígitos supereado${fielNameExtractor(configs)}!`;
    },
    'not-number': (configs) => {
        return `Apenas valores numéricos são aceitos${fielNameExtractor(configs)}!`;
    },
    'not-char': (configs) => {
        return `Apenas letras são aceitas${fielNameExtractor(configs)}!`;
    }
}

// Realiza as validações
function validation(value, configs) {
    let returnValue = true;

    for (const config in configs) {
        if(config in Configuration) {
            const check = Configuration[config](value, configs[config]);
            if(check.error == true) {
                console.log(check);
                returnValue = check;
                returnValue.message = DynamicMessages[check.message](configs);
                break;
            }
        }
    }

    return returnValue;
}

function runValidations() {

}

export { validation, runValidations }