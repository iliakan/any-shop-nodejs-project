const fs = require('fs');
const path = require('path');
const db = require('../libs/db');

module.exports = async function() {
  let validate = db.getValidate('db');

  let result = validate({db: db.getAll()});

  if (!result) {
    console.error("ERROR", validate.errors);
  } else {
    console.log("OK");
  }

  validate = db.getValidate('product');

  let res = validate({
    "id": "kolyaska-adamex-barletta-2-in-1",
    // "title": "Коляска Adamex Barletta 2 in 1",
    "description": "Универсальная модель, которая с легкостью заменит родителям сразу две коляски — люльку для новорожденных и прогулочную для детей в возрасте от 6 месяцев. Коляска Adamex Barletta прекрасно подходит для ежедневного использования в любую пору года. Также в комплектацию входит теплая накидка для ног, дождевик и корзинка для покупок закрытого типа. Родительская ручка регулируется по высоте, есть подстаканник. В прогулочном блоке предусмотрен пятиточечный ремень безопасности, а люлька оснащена текстильной обшивкой из натуральной ткани, которую можно снимать для очистки. Алюминиевый складной каркас, предусмотрена пружинная система амортизации, колеса большие, надувные. Вес с прогулочным блоком составляет 13,2 кг. <div rel=\"v:rating\"><span typeof=\"v:Rating\">Рейтинг модели: <span property='v:value'>4</span> из <span property=\"v:best\">5</span> (<span property=\"v:count\">21</span> оценка)</span></div>",
    "quantity": "test",
    "category": "detskie-tovary-i-igrushki",
    "subcategory": "progulki-i-detskaya-komnata",
    "enabled": true,
    "images": [
      "http://magazilla.ru/jpg_zoom1/598194.jpg",
      "http://mzimg.com/big/o1/et0edczbio1.png",
      "http://mzimg.com/big/j1/et0ezrohaj1.jpg",
      "http://mzimg.com/big/k1/et0f0cmh9k1.jpg",
      "http://mzimg.com/big/h1/et0f0ijl1h1.jpg"
    ],
    "price": 354
  });

  console.log(validate.errors);

};

