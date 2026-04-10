describe("Form pembuatan soal 'Uji Dasar'", () => {
  beforeEach(() => {
    // @ts-expect-error: see commands.ts
    cy.login();
  });

  it(`Harusnya dapat membuat soal "Uji Dasar" dengan benar (valid)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 3
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.get("section").contains("Table Soal Uji Dasar.").should("exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, nama produk "2o5" tidak di isi)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 3
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, nilai uji "TS" tidak lengkap)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 8);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Nilai uji treshold single tidak lengkap.").should(
      "be.visible",
    );
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, nilai uji "TS" tidak di pilih sama sekali)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    cy.get('input[name="treshold-single-values"]').should("have.length", 0);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Nilai uji treshold single tidak lengkap.").should(
      "be.visible",
    );
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, nilai uji "TM" tidak lengkap)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 3
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 4);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Nilai uji treshold mix tidak lengkap.").should("be.visible");
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, nilai uji "TM" tidak di isi sama sekali)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 3
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    cy.get('input[name="treshold-mix-values"]').should("have.length", 0);

    // fill input participant
    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Nilai uji treshold mix tidak lengkap.").should("be.visible");
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, jumlah perserta < 1)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("-10");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, jumlah perserta > 200)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    // fill input participant
    cy.get("input#total-participants").clear().type("250");

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Jumlah peserta minimal 1 dan maksimal 200 orang.").should(
      "be.visible",
    );
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Dasar" (invalid, jumlah perserta > 200)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-dasar");

    // fill input 2o5 creamer
    cy.get('input[name="2-out-of-5-creamer-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(0).type("abc sama");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(1).type("abc beda 1");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(2).type("abc beda 2");

    cy.get('input[name="2-out-of-5-creamer-values"]').eq(3).type("abc beda 3");

    // fill input 2o5 pure
    cy.get('input[name="2-out-of-5-pure-values"]').should("have.length", 4);

    cy.get('input[name="2-out-of-5-pure-values"]').eq(0).type("xyz sama");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(1).type("xyz beda 1");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(2).type("xyz beda 2");

    cy.get('input[name="2-out-of-5-pure-values"]').eq(3).type("xyz beda 3");

    // fill input "TS"
    const rasaIntensitas = ["asam", "asin", "manis", "pahit"];

    rasaIntensitas.forEach((rasa) => {
      // Intensitas 1
      cy.contains("li", new RegExp(`^${rasa} 1$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 2$`, "i")).click();

      // Intensitas 2
      cy.contains("li", new RegExp(`^${rasa} 3$`, "i")).click();
    });
    cy.get('input[name="treshold-single-values"]').should("have.length", 12);

    // fill input for "TM"
    const combinations = [
      ["asam+1", "manis+2"],
      ["asin+1", "pahit+2"],
      ["manis+1", "asam+3"],
      ["pahit+1", "asin+3"],
      ["asam+2", "manis+3"],
    ];

    combinations.forEach(([first, second]) => {
      cy.contains("button", "Pilih Rasa").first().click();
      cy.contains('[role="option"]', first.replace("+", " ")).click();

      cy.contains("button", "Pilih Rasa").last().click();
      cy.contains('[role="option"]', second.replace("+", " ")).click();

      cy.contains("button", "Tambah").click();
    });
    cy.get('input[name="treshold-mix-values"]').should("have.length", 5);

    cy.contains("button", "Buat Soal Uji Dasar").click();

    cy.contains("Jumlah peserta minimal 1 dan maksimal 200 orang.").should(
      "be.visible",
    );
    cy.get("section").contains("Table Soal Uji Dasar.").should("not.exist");
  });
});

describe("Form pembuatan soal 'Uji Produk'", () => {
  beforeEach(() => {
    // @ts-expect-error: see commands.ts
    cy.login();
  });

  it(`Harusnya dapat membuat soal "Uji Produk" dengan benar (valid)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    // fill input "products"
    const products = [
      "Produk 1",
      "Produk 2",
      "Produk 3",
      "Produk 4",
      "Produk 5",
    ];

    products.forEach((product) => {
      cy.contains("label", product).click();
    });

    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.get("section").contains("Table Soal Uji Produk Rtg.").should("exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, tidak memilih kategori produk)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.get("section").contains("Table Soal Uji Produk.").should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, daftar produk terpilih < 5)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    // fill input "products"
    const products = ["Produk 1", "Produk 2", "Produk 3"];

    products.forEach((product) => {
      cy.contains("label", product).click();
    });

    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.contains("Nilai uji identifikasi tidak lengkap.").should("be.visible");
    cy.get("section")
      .contains("Table Soal Uji Produk Rtg.")
      .should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, daftar produk tidak dipilih sama sekali)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    cy.get("input#total-participants").clear().type("50");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.contains("Nilai uji identifikasi tidak lengkap.").should("be.visible");
    cy.get("section")
      .contains("Table Soal Uji Produk Rtg.")
      .should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, jumlah perserta < 1)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    // fill input "products"
    const products = [
      "Produk 1",
      "Produk 2",
      "Produk 3",
      "Produk 4",
      "Produk 5",
    ];

    products.forEach((product) => {
      cy.contains("label", product).click();
    });

    cy.get("input#total-participants").clear().type("-10");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.get("section")
      .contains("Table Soal Uji Produk Rtg.")
      .should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, jumlah perserta > 200)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    // fill input "products"
    const products = [
      "Produk 1",
      "Produk 2",
      "Produk 3",
      "Produk 4",
      "Produk 5",
    ];

    products.forEach((product) => {
      cy.contains("label", product).click();
    });

    cy.get("input#total-participants").clear().type("250");

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.contains("Jumlah peserta minimal 1 dan maksimal 200 orang.").should(
      "be.visible",
    );
    cy.get("section")
      .contains("Table Soal Uji Produk Rtg.")
      .should("not.exist");
  });

  it(`Harusnya tidak dapat membuat soal "Uji Produk" (invalid, jumlah perserta tidak di isi)`, () => {
    cy.visit("http://localhost:3000/dashboard/buat-soal/uji-produk");

    // fill input "product categoris"
    cy.contains("button", "Pilih kategori produk").click();
    cy.contains('[role="option"]', "RTG").click();

    // fill input "products"
    const products = [
      "Produk 1",
      "Produk 2",
      "Produk 3",
      "Produk 4",
      "Produk 5",
    ];

    products.forEach((product) => {
      cy.contains("label", product).click();
    });

    cy.contains("button", "Buat Soal Uji Produk").click();

    cy.contains("Jumlah peserta minimal 1 dan maksimal 200 orang.").should(
      "be.visible",
    );
    cy.get("section")
      .contains("Table Soal Uji Produk Rtg.")
      .should("not.exist");
  });
});

describe("Form pengecekan jawaban ujian", () => {
  beforeEach(() => {
    // @ts-expect-error: see commands.ts
    cy.login();
  });

  it("Harusnya dapat mengecek jawaban ujian (valid)", () => {
    cy.visit("http://localhost:3000/dashboard/daftar-soal");

    cy.contains("p", "Uji Dasar 1/5/2026, 3:00:00 PM").click();

    cy.get("section").contains("Soal kode").should("be.visible");

    cy.contains("button", "Cek Jawaban").click();

    const answerList = [
      "9473",
      "1731",
      "4968",
      "3973",
      "4974",
      "1021",
      "7861",
      "8088",
      "8357",
      "8425",
      "1193",
      "8386",
      "9853",
      "6542",
      "1103",
      "9001",
      "8962",
      "7393",
      "4347",
      "3830",
      "2116",
      "6595",
      "3577",
      "1403",
      "1410",
      "9834",
      "6024",
    ];

    cy.get('form input[type="number"]').each(($el, index) => {
      cy.wrap($el).type(answerList[index]);
    });

    // 3. Klik tombol submit untuk memicu handleCheck
    cy.get('button[type="submit"]').contains("Cek Jawaban").click();

    cy.get('form input[type="number"]').each(($el, index) => {
      if (index === 10) {
        cy.wrap($el).should("not.have.class", "ring-2");
      } else if (index === 12) {
        cy.wrap($el).should("have.class", "ring-yellow-400");
      } else {
        cy.wrap($el).should("have.class", "ring-red-600");
      }
    });
  });

  it("Harusnya input tetap kosong karena hanya menerima input berupa angka (invalid, input dimasukkan selain angka)", () => {
    cy.visit("http://localhost:3000/dashboard/daftar-soal");

    cy.contains("p", "Uji Dasar 1/5/2026, 3:00:00 PM").click();

    cy.get("section").contains("Soal kode").should("be.visible");

    cy.contains("button", "Cek Jawaban").click();

    const answerList = [
      "kzrq",
      "mwpb",
      "vjtx",
      "hcln",
      "sfdy",
      "qgka",
      "zpli",
      "xbun",
      "ertm",
      "oiva",
      "jsdh",
      "kycg",
      "ufql",
      "pznm",
      "vbre",
      "twax",
      "lgio",
      "ksdf",
      "hjzq",
      "pxcv",
      "mnot",
      "ryui",
      "asdf",
      "ghjk",
      "lzxc",
      "vbnm",
      "qwer",
    ];

    cy.get('form input[type="number"]').each(($el, index) => {
      cy.wrap($el).type(answerList[index]);
    });

    cy.get('form input[type="number"]').each(($el) => {
      cy.wrap($el).should("have.value", "");
    });

    cy.get('button[type="submit"]').contains("Cek Jawaban").click();

    cy.contains("Setidaknya masukkan 1 kode.").should("be.visible");
  });

  it("Harusnya tidak dapat mengecek jawaban ujian, (ivalid, ada duplikat jawaban yang dimasukkan)", () => {
    cy.visit("http://localhost:3000/dashboard/daftar-soal");

    cy.contains("p", "Uji Dasar 1/5/2026, 3:00:00 PM").click();

    cy.get("section").contains("Soal kode").should("be.visible");

    cy.contains("button", "Cek Jawaban").click();

    const answerList = [
      "9473",
      "1731",
      "4968",
      "3973",
      "4974",
      "1021",
      "7864",
      "8088",
      "8357",
      "8425",
      "5092",
      "8386",
      "2731",
      "6542",
      "1103",
      "9001",
      "8961",
      "7393",
      "4347",
      "3830",
      "2116",
      "6595",
      "3577",
      "1403",
      "1410",
      "9834",
      "9834",
    ];

    cy.get('form input[type="number"]').each(($el, index) => {
      cy.wrap($el).type(answerList[index]);
    });

    cy.get('button[type="submit"]').contains("Cek Jawaban").click();

    cy.contains("Kode yang dimasukkan tidak boleh ada yang sama.").should(
      "be.visible",
    );
  });

  it("Harusnya tidak dapat mengecek jawaban ujian, (ivalid, tidak di isi sama sekali)", () => {
    cy.visit("http://localhost:3000/dashboard/daftar-soal");

    cy.contains("p", "Uji Dasar 1/5/2026, 3:00:00 PM").click();

    cy.get("section").contains("Soal kode").should("be.visible");

    cy.contains("button", "Cek Jawaban").click();

    cy.get('button[type="submit"]').contains("Cek Jawaban").click();

    cy.contains("Setidaknya masukkan 1 kode.").should("be.visible");
  });
});
