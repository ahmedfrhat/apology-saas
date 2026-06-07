const DEFAULT_CONFIG_TEMPLATE = {
  boyName: "",
  girlName: "",
  girlNickname: "",
  landingText: "في وسط أي زعل.. فيه حاجات تانية مستحيل تضيع.. انزلي شوفي {girlNickname}",
  loaderTexts: [
    "$ Initializing {girlNickname} Protocol...",
  ],
  judgeText: {
    title: "بعد دراسة الأدلة والمرافعات... المحكمة تحكم لصالح {girlName}! ⚖️❤️",
    details: "القاضي: كل اللي عملته {girlName} صح والباقي كلامه فارغ 😂"
  }
};

const boyName = "Ahmed";
const girlName = "Manar";
const girlNickname = "Manourti";

const configBase = {
  ...DEFAULT_CONFIG_TEMPLATE,
  boyName,
  girlName,
  girlNickname
};

const deepReplace = (obj) => {
  if (typeof obj === 'string') {
    return obj
      .replace(/{boyName}/g, boyName)
      .replace(/{girlName}/g, girlName)
      .replace(/{girlNickname}/g, girlNickname);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepReplace);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = deepReplace(obj[key]);
    }
    return newObj;
  }
  return obj;
};

const config = deepReplace(configBase);
console.log(JSON.stringify(config, null, 2));
