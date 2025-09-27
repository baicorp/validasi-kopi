import { formatArrKeTJ } from "../utils";

export class UjiDasar {
  constructor(
    // pilihan treshold single (pilih 12).
    // "hambar", "asam 1", "asam 2", "asam 3",
    // "asin 1", "asin 2", "asin 3",
    // "manis 1", "manis 2", "manis 3",
    // "pahit 1", "pahit 2", "pahit 3"
    private nilaiTresholdSingle: string[],
    // pilihan treshold mix (pilih 5).
    // Asam + Asin
    // Asam + Manis
    // Asam + Pahit
    // Asin + Manis
    // Asin + Pahit
    // Manis + Pahit
    private nilaiTresholdMix: string[],
    private isIncludeTwoOutOfFivePure: boolean,
    private jumlahPesertaUjian: number,
    private jumlahGelasTwoOutOfFive = 5,
    private jumlahGelasTresholdSingle = 12,
    private jumlahGelasTresholdMix = 5,
  ) {}

  private buatKodeRandomEmpatDigit(): string {
    // buat kode random 4 digit, range 1000 - 9999
    // untuk uji dasar maksimal 409 peserta (9000 / 22); 9000->kode unik, 22 cup sampel
    return (Math.floor(Math.random() * 9000) + 1000).toString();
  }

  private pasangkanKodeDenganNilaiSamaRata(
    listKodeRandom: string[],
    listNilai: string[],
  ) {
    // inisialisasi map nilai -> array kosong
    const hasilMap: Record<string, string[]> = {};
    listNilai.forEach((nilai) => (hasilMap[nilai] = []));

    // bagi rata kode random
    listKodeRandom.forEach((kode, index) => {
      const nilai = listNilai[index % listNilai.length];
      hasilMap[nilai].push(kode);
    });

    // convert ke format array of object
    return Object.entries(hasilMap)
      .map(([key, value]) => ({
        [key]: formatArrKeTJ(value),
      }))
      .sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
  }

  // implementasi 2 out of 5
  private buatKodeTwoOutOfFive(listKodeRandom: string[]) {
    console.log(listKodeRandom.length);
    if (listKodeRandom.length % this.jumlahGelasTwoOutOfFive !== 0) {
      throw Error("Error 2 out of 5 : jumlah list kode random tidak valid");
    }

    // terdapat 2 kode bernilai "sama" dan 3 kode bernilai "beda"
    // jika isIncludeTwoOutOfFivePure bernilai true maka samax2 dan bedax2
    const multiplier = this.isIncludeTwoOutOfFivePure ? 2 : 1;
    const jumlahKodeBernilaiSama = this.jumlahPesertaUjian * 2 * multiplier;
    const jumlahKodeBernilaiBeda = this.jumlahPesertaUjian * 3 * multiplier;

    const listKodeBernilaiSama = listKodeRandom.slice(
      0,
      jumlahKodeBernilaiSama,
    );
    const listKodeBernilaiBeda = listKodeRandom.slice(
      jumlahKodeBernilaiSama,
      jumlahKodeBernilaiSama + jumlahKodeBernilaiBeda,
    );

    const hasil: Record<string, string[][]>[] = [
      { sama: formatArrKeTJ(listKodeBernilaiSama) },
      { beda: formatArrKeTJ(listKodeBernilaiBeda) },
    ];

    return hasil;
  }

  // Implementasi kode untuk treshold single
  private buatKodeTresholdSingle(listKodeRandom: string[]) {
    // validasi panjang array
    if (listKodeRandom.length % this.jumlahGelasTresholdSingle !== 0) {
      throw Error(
        "Error Treshold Single : jumlah list kode random tidak valid",
      );
    }

    return this.pasangkanKodeDenganNilaiSamaRata(
      listKodeRandom,
      this.nilaiTresholdSingle,
    );
  }

  // Implementasi kode untuk treshold mix
  private buatKodeTresholdMix(listKodeRandom: string[]) {
    if (listKodeRandom.length % this.jumlahGelasTresholdMix !== 0) {
      throw Error("Error Treshold Mix : jumlah list kode random tidak valid");
    }

    return this.pasangkanKodeDenganNilaiSamaRata(
      listKodeRandom,
      this.nilaiTresholdMix,
    );
  }

  buatKodeUjiDasar() {
    // verifikasi total list nilai tresholdSingle 12
    // dan total list nilai tresholdMix 5
    if (
      this.nilaiTresholdSingle.length !== 12 ||
      this.nilaiTresholdMix.length !== 5 ||
      this.jumlahPesertaUjian <= 0
    ) {
      throw Error("kombinasi list treshold single / mix tidak sesuai");
    }

    const kodeRandom = new Set<string>();

    // jika include 2 out of 5 pure maka jumlahKodeTwoOutOfFive x2
    const multiplier = this.isIncludeTwoOutOfFivePure ? 2 : 1;
    const jumlahKodeTwoOutOfFive =
      this.jumlahPesertaUjian * this.jumlahGelasTwoOutOfFive * multiplier;
    const jumlahKodeTresholdSingle =
      this.jumlahPesertaUjian * this.jumlahGelasTresholdSingle;
    const jumlahKodeTresholdMix =
      this.jumlahPesertaUjian * this.jumlahGelasTresholdMix;
    const totalKodeDibutuhkan =
      jumlahKodeTwoOutOfFive + jumlahKodeTresholdSingle + jumlahKodeTresholdMix;

    // pastikan kode tidak melebihi maksimal kode unik yand dapat
    // dibuat untuk 4 digit (maksimal 9000 total kode unik 4 digit)
    if (totalKodeDibutuhkan > 9000) {
      throw new Error("Jumlah kode melebihi kapasitas unik (9000).");
    }

    while (kodeRandom.size < totalKodeDibutuhkan) {
      kodeRandom.add(this.buatKodeRandomEmpatDigit());
    }

    const listKodeRandom = Array.from(kodeRandom);
    let offset = 0;

    const listKodeTwoOutOfFive = listKodeRandom.slice(
      offset,
      jumlahKodeTwoOutOfFive,
    );
    offset += jumlahKodeTwoOutOfFive;

    const listKodeTresholdSingle = listKodeRandom.slice(
      offset,
      jumlahKodeTresholdSingle + offset,
    );
    offset += jumlahKodeTresholdSingle;

    const listKodeTresholdMix = listKodeRandom.slice(
      offset,
      jumlahKodeTresholdMix + offset,
    );

    return [
      {
        tipeUjian: "2 Out Of 5",
        soal: this.buatKodeTwoOutOfFive(listKodeTwoOutOfFive),
        totalKode: listKodeTwoOutOfFive.length,
      },
      {
        tipeUjian: "Treshold Single",
        soal: this.buatKodeTresholdSingle(listKodeTresholdSingle),
        totalKode: listKodeTresholdSingle.length,
      },
      {
        tipeUjian: "Treshold Mix",
        soal: this.buatKodeTresholdMix(listKodeTresholdMix),
        totalKode: listKodeTresholdMix.length,
      },
    ];
  }
}

export class UjiProduk {
  constructor(
    // masukkan list produk untuk uji identifikasi
    // harus 5 produk yang dimasukkan untuk uji identifikasi
    private nilaiIdentifikasi: string[],
    private jumlahPesertaUjian: number,
    private jumlahGelasIdentifikasi = 5,
    private jumlahGelasTriangle = 3,
    private jumlahGelasSkoring = 5,
  ) {}

  private buatKodeRandomEmpatDigit(): string {
    // buat kode random 4 digit, range 1000 - 9999
    // untuk uji dasar maksimal 409 peserta (9000 / 22); 9000->kode unik, 22 cup sampel
    return (Math.floor(Math.random() * 9000) + 1000).toString();
  }

  private pasangkanKodeDenganNilaiSamaRata(
    listKodeRandom: string[],
    listNilai: string[],
  ) {
    // inisialisasi map nilai -> array kosong
    const hasilMap: Record<string, string[]> = {};
    listNilai.forEach((nilai) => (hasilMap[nilai] = []));

    // bagi rata kode random
    listKodeRandom.forEach((kode, index) => {
      const nilai = listNilai[index % listNilai.length];
      hasilMap[nilai].push(kode);
    });

    // convert ke format array of object
    return Object.entries(hasilMap)
      .map(([key, value]) => ({
        [key]: formatArrKeTJ(value),
      }))
      .sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
  }

  private buatKodeIndentifikasi(listKodeRandom: string[]) {
    if (listKodeRandom.length % this.jumlahGelasIdentifikasi !== 0) {
      throw Error("Error Identifikasi : jumlah list kode random tidak valid");
    }

    return this.pasangkanKodeDenganNilaiSamaRata(
      listKodeRandom,
      this.nilaiIdentifikasi,
    );
  }

  private buatKodeTriangle(listKodeRandom: string[]) {
    if (listKodeRandom.length % this.jumlahGelasTriangle !== 0) {
      throw Error("Error Triangle : jumlah list kode random tidak valid");
    }

    // terdapat 2 kode bernilai "sama" dan 1 kode bernilai "beda"
    // peserta diminta untuk memilih kode mana yang bernilai beda
    const jumlahKodeBernilaiSama = this.jumlahPesertaUjian * 2;
    const jumlahKodeBernilaiBeda = this.jumlahPesertaUjian;

    const listKodeBernilaiSama = listKodeRandom.slice(
      0,
      jumlahKodeBernilaiSama,
    );
    const listKodeBernilaiBeda = listKodeRandom.slice(
      jumlahKodeBernilaiSama,
      jumlahKodeBernilaiSama + jumlahKodeBernilaiBeda,
    );

    const hasil: Record<string, string[][]>[] = [
      { sama: formatArrKeTJ(listKodeBernilaiSama) },
      { beda: formatArrKeTJ(listKodeBernilaiBeda) },
    ];

    return hasil;
  }

  private buatKodeSkoring(listKodeRandom: string[]) {
    if (listKodeRandom.length % this.jumlahGelasSkoring !== 0) {
      throw Error("Error Skoring : jumlah list kode random tidak valid");
    }

    const nilaiSkoring = ["1.5", "2", "3", "4", "5"];
    return this.pasangkanKodeDenganNilaiSamaRata(listKodeRandom, nilaiSkoring);
  }

  buatKodeUjiProduk() {
    // verifikasi total list nilai identifikasi 5
    // dan jumlah peserta minimal 1
    if (
      this.nilaiIdentifikasi.length !== this.jumlahGelasIdentifikasi ||
      this.jumlahPesertaUjian <= 0
    ) {
      throw Error(
        "Jumlah peserta minimal 1 / list produk identifikasi tidak sesuai.",
      );
    }

    const kodeRandom = new Set<string>();

    const jumlahKodeidentifikasi =
      this.jumlahPesertaUjian * this.jumlahGelasIdentifikasi;
    const jumlahKodeTriangle =
      this.jumlahPesertaUjian * this.jumlahGelasTriangle;
    const jumlahKodeSkoring = this.jumlahPesertaUjian * this.jumlahGelasSkoring;
    const totalKodeDibutuhkan =
      jumlahKodeidentifikasi + jumlahKodeTriangle + jumlahKodeSkoring;

    // pastikan kode tidak melebihi maksimal kode unik yand dapat
    // dibuat untuk 4 digit (maksimal 9000 total kode unik 4 digit)
    if (totalKodeDibutuhkan > 9000) {
      throw new Error("Jumlah kode melebihi kapasitas unik (9000).");
    }

    while (kodeRandom.size < totalKodeDibutuhkan) {
      kodeRandom.add(this.buatKodeRandomEmpatDigit());
    }

    const listKodeRandom = Array.from(kodeRandom);

    let offset = 0;

    const listKodeIdentifikasi = listKodeRandom.slice(
      offset,
      jumlahKodeidentifikasi,
    );
    offset += jumlahKodeidentifikasi;

    const listKodeTriangle = listKodeRandom.slice(
      offset,
      jumlahKodeTriangle + offset,
    );
    offset += jumlahKodeTriangle;

    const listKodeSkoring = listKodeRandom.slice(
      offset,
      jumlahKodeSkoring + offset,
    );

    return [
      {
        tipeUjian: "Identifikasi",
        soal: this.buatKodeIndentifikasi(listKodeIdentifikasi),
        totalKode: listKodeIdentifikasi.length,
      },
      {
        tipeUjian: "Triangle",
        soal: this.buatKodeTriangle(listKodeTriangle),
        totalKode: listKodeTriangle.length,
      },
      {
        tipeUjian: "Skoring",
        soal: this.buatKodeSkoring(listKodeSkoring),
        totalKode: listKodeSkoring.length,
      },
    ];
  }
}
