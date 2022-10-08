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
                                    text={`Invites you to join "${value.nameProject}" for ${value.client}`}
                                />
                            )
                        case "INVOICE_DISCOUNT":
                            return (
                                <CardNotification
                                    Icon={() =>
                                        <Image height={32} width={32} alt="Third party invoice" src={RequestMoney} />
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
                                    title="Third party invoice"
                                    text={`Invoice discrepancy amounts to ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} from ${value.name}.`}
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
                                    text={`agrees to join "${value.nameProject}" for ${value.client}`}
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
                                    Icon={() => <Image height={32} width={32} alt="Collected" src={Charged} />}
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
                        case "PAID":
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
                                    Icon={() => <Image height={32} width={32} alt="Income" src={SalaryMale} />}
                                    keyNoti={key}
                                    title={`New Income`}
                                    text={`your payment is available ${value.currency} ${value.salarysettlement} from project ${value.nameProject} commissioned by ${value.client}`}
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
                                    text={`requests withdrawal of ${value.currency} ${value.withdraw}`}
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
                                    text={`Requests currency exchange for ${value.currency} ${value.amount}`}
                                />
                            )
                        case "TRANSFERENCE_CONFIRM":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <PriceCheckIcon color="disabled" />}
                                    keyNoti={key}
                                    title={"Transfer completed"}
                                    text={`withdrawal of ${value.currency} ${value.withdrawal} confirmed.`}
                                />

                            )
                        case "CURRENCY_CONVERSION_CONFIRM":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <Image height={32} width={32} alt={"Currency Conversion Confirm"} src={Exchange} />}
                                    keyNoti={key}
                                    title={"Currency exchange confirmed."}
                                    text={`Exchange for ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} confirmed.`}
                                />
                            )
                        case "CURRENCY_CONVERSION_REJECT":
                            return (
                                <CardNotification
                                    value={value}
                                    href={`/wallet`}
                                    Icon={() => <Image height={32} width={32} alt={"Currency Conversion Confirm"} src={Exchange} />}
                                    keyNoti={key}
                                    title={"Currency exchange failed"}
                                    text={`Exchange for ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} was rejected.`}
                                />
                            )
                    }
                }
                ).reverse()[0]
            }
        </>
    )
}