import { Building2, Home, LandPlot } from "lucide-react";
import { Link } from "react-router-dom";

const options = [
  { type: "apartamento", label: "Apartamentos", detail: "Praticidade e localização", Icon: Building2 },
  { type: "casa", label: "Casas", detail: "Espaço para novos capítulos", Icon: Home },
  { type: "lote", label: "Lotes", detail: "O começo do seu projeto", Icon: LandPlot },
];

export function PropertyTypeButtons() {
  return (
    <div className="type-grid">
      {options.map(({ type, label, detail, Icon }, index) => (
        <Link to={`/imoveis?tipo=${type}`} className="type-card" key={type}>
          <span className="type-index">0{index + 1}</span>
          <Icon size={34} strokeWidth={1.4} />
          <div><h3>{label}</h3><p>{detail}</p></div>
          <span className="type-link">Explorar <b>↗</b></span>
        </Link>
      ))}
    </div>
  );
}
