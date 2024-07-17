const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

(async () => {
  const URL = "https://listado.mercadolibre.com.ar/medias-para-programadores#D[A:medias%20para%20programadores%20]";
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  const title = await page.title();
  console.log(`Titulo de la pagina: ${title}`);


  let nextPage = true;
  let products = [];

  while (nextPage) {
    await page.waitForSelector('.ui-search-item__title', { timeout: 10000 });
    const newProducts = await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll('.ui-search-result__wrapper'))

        return products.map(product => {
            const title = product.querySelector('.ui-search-item__title')
            const price = product.querySelector('.andes-money-amount__fraction')
            return {
              title: title ? title.innerText : null,
              price: price ? price.innerText : null
            };
        })
    })
    
    products = [...products, ...newProducts];
    
    nextPage = await page.evaluate(() => {
      const nextButton = document.querySelector('.andes-pagination__button--next a')
      if (nextButton) {
        nextButton.click()
        return true
      }
      return false
    })

  }
  console.log(products)

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(products);
  xlsx.utils.book_append_sheet(wb, ws, "Products");
  xlsx.writeFile(wb, "products.xlsx");

})();