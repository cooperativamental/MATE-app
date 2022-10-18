import { useState, useEffect } from "react";

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useProgram } from "../../hooks/useProgram/index.ts"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { getDatabase, ref, set, push } from "firebase/database";
import { doc, updateDoc, collection, arrayUnion, getDocs, getDoc, where, query as queryFirestore } from "firebase/firestore"

import { useAuth } from "../../context/auth";

import InputSelect from "../Elements/InputSelect"
import { MultiSelectPartner } from "../MultiSelect"
import ComponentButton from "../Elements/ComponentButton";
import { MultiSelectPartners } from "../MultiSelectPartners";

const CreateOrganizations = () => {
    const db = getDatabase()
    const { firestore, user } = useAuth()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });
    const { publicKey } = useWallet()

    const [errors, setErrors] = useState({})
    const [listPartners, setListPartners] = useState()
    const [listMate, setListMate] = useState()
    const [organization, setOrganization] = useState({
        name: "",
        activity: "",
        treasury: 0,
    });

    useEffect(() => {
        const arrErrors = Object.entries(organization).map(([prop, value]) => {
            return [prop, !value]
        })
        const objErrors = Object.fromEntries(arrErrors)
        setErrors(objErrors)
    }, [listPartners, organization])

    useEffect(() => {
        if (publicKey) {
            (async () => {
                const creatorUser = await getDoc(doc(firestore, "users", user.uid))
                const { userName, ...resUser } = creatorUser.data()
                setListMate({
                    ...listMate,
                    [user.uid]: {
                        ...resUser,
                        name: userName,
                        wallets: publicKey.toBase58()
                    }
                })
                setListPartners({
                    ...listPartners,
                    [user.uid]: {
                        ...resUser,
                        name: userName,
                        wallets: publicKey.toBase58()
                    }
                })
            })()
        }
    }, [publicKey])

    const searchFunction = async (searchMate) => {

        const users = await getDocs(
            queryFirestore(
                collection(firestore, "users"),
                where("wallets", "array-contains", searchMate)
            ))
        let resPartners = {}

        users.forEach(user => {
            const { userName, ...resUser } = user.data()
            resPartners = {
                ...resPartners,
                [user.id]: {
                    ...resUser,
                    name: userName,
                    wallets: searchMate
                }
            }
        })
        if (listPartners && Object.keys(listPartners).length) {
            setListMate({
                ...listPartners,
                ...resPartners
            })
        } else {
            setListMate({
                ...resPartners
            })
        }
    }


    const organizationChange = (e) => {
        if (e.target.name === "treasury") {
            setOrganization({
                ...organization,
                [e.target.name]: Number(e.target.value),
            });
        } else {
            setOrganization({
                ...organization,
                [e.target.name]: e.target.value,
            });
        }
    };

    const createOrganization = async () => {
        const partnersToOrganizationWeb3 = Object.values(listPartners).map(partner => {
            return new PublicKey(partner.wallets)
        })
        const keyOrganization = anchor.web3.Keypair.generate();
        const keyTreasury = anchor.web3.Keypair.generate();
        const tx = await program.rpc
            .createGroup(
                organization.name,
                organization.treasury * 100,
                partnersToOrganizationWeb3, //reemplazar por wallets-
                {
                    accounts: {
                        group: keyOrganization.publicKey,
                        treasury: keyTreasury.publicKey,
                        initializer: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    },
                    signers: [keyOrganization]
                }
            )
        // const groupRef = ref(db, "groups/");
        // const pushGroup = push(groupRef);

        // set(pushGroup, {
        //     ...group,
        //     treasury: group.treasury / 100
        // })
        updateDoc(doc(firestore, "users", user.uid), {
            organization: arrayUnion(keyOrganization.publicKey.toBase58())
        })
        Object.keys(listPartners).map((keyPartner) => {
            updateDoc(doc(firestore, "users", keyPartner), {
                organization: arrayUnion(keyOrganization.publicKey.toBase58())
            })
        })
        console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        alert("success")

    }

    return (
        <div className="flex flex-col w-6/12 items-center gap-8 pb-4 h-min mt-12">
            <h1 className=" text-xl font-medium">New Team</h1>
            <p>Build your team with partners, not employees. To manage collaborative ownership projects.</p>

            <InputSelect
                id="name"
                placeholder="Team Name"
                type="text"
                name="name"
                value={organization.name}
                onChange={organizationChange}
                inputStyle="text-center"
            />
            <InputSelect
                id="activity"
                placeholder="Activity"
                type="text"
                name="activity"
                value={organization.activity}
                onChange={organizationChange}
                inputStyle="text-center"
            />
            <InputSelect
                id="treasury"
                placeholder="Team treasury %"
                type="number"
                name="treasury"
                value={organization.treasury.toString()}
                onChange={organizationChange}
                title="Fund the Treasury. Set aside a slice (%) of the project’s budget for later rewards and bonuses"
                inputStyle="text-center"
            />
            {/* <MultiSelect
                label="Search your Team Mate"
                options={listMate}
                searchFunction={setSearchMate}
                selectState={listPartners}
                setSelectState={setListPartners}
            /> */}
            <WalletMultiButton />
            {
                (!!connection && !!publicKey) &&
                <>
                    <MultiSelectPartners
                        options={listMate}
                        blockOption={user?.uid}
                        searchFunction={searchFunction}
                        selectState={listPartners}
                        setSelectState={setListPartners}
                    />
                    <ComponentButton
                        // className="flex h-12 w-max bg-[#5A31E1] rounded-xl text-3xl text-white font-medium items-center p-6 "
                        buttonEvent={createOrganization}
                        buttonText="Create Team"
                        conditionDisabled={errors && Object.values(errors).find(prop => !!prop)}
                    />
                </>
            }




        </div>
    );
}

export default CreateOrganizations