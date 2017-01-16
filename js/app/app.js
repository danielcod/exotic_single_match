var Main=function() {
    var productForm=React.createElement(ProductForm, {});
    var parent=$("div[id='products']")[0];
    ReactDOM.render(productForm, parent);
};
