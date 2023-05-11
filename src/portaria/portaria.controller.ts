import { Controller, Get, Query } from "@nestjs/common";
import { PortariaServices } from "./portaria.services";

@Controller('portaria')
export class PortariaController {

  constructor(private readonly PortariaService: PortariaServices) { }

  @Get("importa_ingresso")
  async importaIngresso(@Query('pEvento') pEvento: string) {
    return await this.PortariaService.importaIngresso(Number(pEvento))
  }

  @Get("ingresso")
  async ingresso(@Query('pIngresso') pIngresso: string) {
    return await this.PortariaService.ingressoConsultaBaixa(pIngresso)
  }

  @Get("qrcode")
  async qrcode(@Query('pIngresso') pIngresso: string) {
    return await this.PortariaService.qrCodeConsultaBaixa(pIngresso)
  }

  @Get("matricula")
  async matricula(@Query('pMatricula') pMatricula: string) {
    return await this.PortariaService.matriculaConsulta(Number(pMatricula))
  }

  @Get("cpf")
  async cpf(@Query('pCpf') pCpf: string) {
    return await this.PortariaService.cpfConsultaBaixa(pCpf)
  }

  @Get("lista_presentes")
  async listaPresentes() {
    return await this.PortariaService.listaPresentes()
  }
  @Get("clear_base")
  async clear_base() {
    return await this.PortariaService.clear_base()
  }

}