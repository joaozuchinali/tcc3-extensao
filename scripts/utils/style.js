// Configura a exibição dos componentes em tela
function clsToggle(ele, cls, status) {
    if(status == 0)
    ele.classList.remove(cls);

    if(status == 1)
    ele.classList.add(cls)
}

export { clsToggle };