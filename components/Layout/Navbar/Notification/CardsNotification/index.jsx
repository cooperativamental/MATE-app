import { useNotification } from '../../../../../context/notification'
import { CardNotification } from "./CardNotification"
import Image from 'next/image'
import Charged from "/public/Bank.png"
import Exchange from "/public/Exchange.png";
import SalaryMale from "/public/Salarymale.png";
import RequestMoney from "/public/RequestMoney.svg";
import GroupsIcon from '@mui/icons-material/Groups';
import RecommendIcon from '@mui/icons-material/Recommend';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaidIcon from '@mui/icons-material/Paid';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';


export const CardsNotification = () => {
    const { lastNotification } = useNotification()

    return (
        <>
            {
                lastNotification && Object.entries(lastNotification).map(([key, value]) => {
                    switch (value.type) {
                        case "NEW_PROJECT":
                            return (
                                <CardNotification
                                    Icon={() => <GroupsIcon color="disabled" />}
                                    href={{
                                        pathname: "/projects/[id]",
                                        query: {
                                            id: value.projectID
                                        }
                                    }}
                                    as="/projects/"
                                    value={value}
                                    keyNoti={key}
                                    title={value.projectHolder}
                                    text={`is sending a proposal to join "${value.nameProject}" for ${value.client}`}
                                />
                            )
                        case "INVOICE_DISCOUNT":
                            return (
                                <CardNotification
                                    Icon={() =>
                                        <Image height={32} width={32} alt="Descuento de Factura" src={RequestMoney} />
                                    }
                                    href={{
                                        pathname: `/wallet/movements`,
                                        query: {
                                            type: "INVOICE_DISCOUNT"
                                        }
                                    }}
                                    as="/wallet/movements"
                                    value={value}
                                    keyNoti={key}
                                    title="Factura de terceros."
                                    text={`Descuento de factura por ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} de ${value.name}.`}
                                />
                            )
                        case "CONFIRM_PARTNER":
                            return (
                                <CardNotification
                                    Icon={() => <RecommendIcon color="disabled" />}
                                    href={{
                                        pathname: "/adminprojects",
                                        query: {
                                            prj: value.projectID
                                        }
                                    }}
                                    as="/adminprojects"
                                    value={value}
                                    keyNoti={key}
                                    title={value.namePartner}
                                    text={`is onboard to team "${value.nameProject}" for ${value.client}`}
                                />

                            )
                        case "INVOICE_CALL":
                            return (
                                <CardNotification
                                    value={value}
                                    href={{
                                        pathname: "/admin/project",
                                        query: {
                                            prj: value.projectID,
                                            organization: value.organization
                                        }
                                    }}
                                    as="/admin/project"
                                    Icon={() => <NoteAddIcon color="disabled" />}
                                    keyNoti={key}
                                    title={value.projectHolder}
                                    text={`Requiers invoicing
                                            ${value?.percentage === 1 ?
                                            " 100% " :
                                            value?.percentage === 2 ?
                                                " 50% " :
                                                " 1/3 "
                                        }
                                            of "${value.nameProject}" for ${value.client}`}
                                />

                            )
                        case "INVOICE_ORDER":
                            return (
                                <CardNotification
                                    value={value}
                                    href={{
                                        pathname: "/adminprojects",
                                        query: {
                                            prj: value.projectID,
                                            organization: value.organization
                                        }
                                    }}
                                    as="/adminprojects"
                                    Icon={() => <RequestPageIcon color="disabled" />}
                                    keyNoti={key}
                                    title={value.nameProject}
                                    text={`Invoiced to ${value.client}`}
                                />
                            )
                        case "BILL_COLLECTED":
                            return (
                                <CardNotification
                                    value={value}
                                    href={{
                                        pathname: "/adminprojects",
                                        query: {
                                            prj: value.projectID
                                        }
                                    }}
                                    as="/adminprojects"
                                    Icon={() => <Image height={32} width={32} alt="Cobrado" src={Charged} />}
                                    keyNoti={key}
                                    title={`${value.client} paid`}
                                    text={`${value?.percentage === 1 ?
                                        " 100% " :
                                        value?.percentage === 2 ?
                                            "50% " :
                                            "1/3 "
                                        }
                                    project "${value.nameProject}" was paid by ${value.client}`}
                                />
                            )
                        case "LIQUIDATED":
                            return (
                                <CardNotification
                                    value={value}
                                    href={{
                                        pathname: "/projects/[id]",
                                        query: {
                                            id: value.projectID
                                        }
                                    }}
                                    as="/projects/"
                                    Icon={() => <Image height={32} width={32} alt="Liquidado" src={SalaryMale} />}
                                    keyNoti={key}
                                    title={`Nueva Liquidación`}
                                    text={`Se acreditó tu liquidación de ${value.currency} ${value.salarysettlement} del proyecto ${value.nameProject} de ${value.client}`}
                                />
                            )
                        case "WITHDRAWAL":
                            return (
                                <CardNotification
                                    href={{
                                        pathname: "/admin/transferences/[id]",
                                        query: {
                                            id: value.withdrawID,
                                            u: value.userID
                                        }
                                    }}
                                    as="/admin/transferences"
                                    value={value}
                                    Icon={() => <PaidIcon color="disabled" />}
                                    keyNoti={key}
                                    title={value.petitioner}
                                    text={`Solicita el retiro de ${value.currency} ${value.withdraw}`}
                                />
                            )
                        case "CURRENCY_CONVERSION":
                            return (
                                <CardNotification
                                    value={value}
                                    keyNoti={key}
                                    href={{
                                        pathname: "/admin/currencyconversion/[id]",
                                        query: {
                                            id: value.currencyconversionID,
                                            u: value.userID
                                        }
                                    }}
                                    as="/admin/currencyconversion/"
                                    title={value.petitioner}
                                    Icon={() => <CurrencyExchangeIcon color="disabled" />}
                                    text={`Solicita el cambio de ${value.currency} ${value.amount}`}
                                />
                            )
                        case "TRANSFERENCE_CONFIRM":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <PriceCheckIcon color="disabled" />}
                                    keyNoti={key}
                                    title={"Transferencia Confirmada"}
                                    text={`Retiro de ${value.currency} ${value.withdrawal} procesado.`}
                                />

                            )
                        case "CURRENCY_CONVERSION_CONFIRM":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <Image height={32} width={32} alt={"Currency Conversion Confirm"} src={Exchange} />}
                                    keyNoti={key}
                                    title={"Conversion de moneda confirmada."}
                                    text={`Cambio de ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} procesado.`}
                                />
                            )
                        case "CURRENCY_CONVERSION_REJECT":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <Image height={32} width={32} alt={"Currency Conversion Confirm"} src={Exchange} />}
                                    keyNoti={key}
                                    title={"Conversion de moneda rechazada."}
                                    text={`Cambio de ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} fue rechazado.`}
                                />
                            )
                    }
                }
                ).reverse()[0]
            }
        </>
    )
}