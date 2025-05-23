const fs = require("fs");
const path = require("path");

const analyticsScript = `
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-X46HGF49KS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-X46HGF49KS');
  </script>
`;

const htmlFiles = fs.readdirSync("./").filter(file => file.endsWith(".html"));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes("gtag")) {
    const updated = content.replace("<head>", `<head>\n${analyticsScript}`);
    fs.writeFileSync(file, updated, "utf8");
    console.log(`✅ Injected GA into ${file}`);
  } else {
    console.log(`ℹ️ Already has GA: ${file}`);
  }
});
