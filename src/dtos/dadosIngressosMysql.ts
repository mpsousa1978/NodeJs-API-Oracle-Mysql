class DadosIngressosMysql {
  id_portaria_festa_junina: number
  id_cupom: number;
  ingresso: number;
  qrcode: string;
  id_estab: number;
  id_setor: number;
  matricula: number;
  nome: string;
  idade: number;
  nascimento: Date;
  sexo: string;
  parentesco: string;
  check_in: Date;
  valor: number;
  faixa_idade: string;
  sorteio: number;
  cpf: string;
  condicao: string;
  tempo_afpesp_dias: number;
}

export { DadosIngressosMysql }