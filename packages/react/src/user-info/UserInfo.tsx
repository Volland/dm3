import React, { useContext, useEffect, useState } from 'react';
import './UserInfo.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';
import Icon from '../ui-shared/Icon';

import Avatar, { SpecialSize } from '../ui-shared/Avatar';
import { AccountInfo } from '../reducers/shared';
import { useAsync } from '../ui-shared/useAsync';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import axios from 'axios';

interface UserInfoProps {
    account: Lib.account.Account;
}

interface EnsTextRecords {
    email?: string;
    url?: string;
    twitter?: string;
    github?: string;
}

function UserInfo(props: UserInfoProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const [publishButtonState, setPublishButtonState] = useState<ButtonState>(
        ButtonState.Idel,
    );

    const [ensTextRecords, setEnsTextRecords] = useState<
        EnsTextRecords | undefined
    >();

    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');
    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (state?.connection?.account?.profile === undefined) {
                return;
            }
            const deliveryServiceProfile =
                await Lib.delivery.getDeliveryServiceProfile(
                    //TODO Implement usage of all delivery services
                    //https://github.com/corpus-ventures/dm3/issues/330
                    state.connection.account.profile.deliveryServices[0],
                    state.connection,
                    async (url) => (await axios.get(url)).data,
                );

            setdeliveryServiceUrl(deliveryServiceProfile!.url);
        };

        getDeliveryServiceUrl();
    }, [state.connection.account?.profile]);

    const getTextRecords = async (): Promise<EnsTextRecords | undefined> => {
        if (
            (state.accounts.accountInfoView === AccountInfo.Account ||
                state.accounts.accountInfoView === AccountInfo.Contact) &&
            state.connection.provider
        ) {
            return Lib.external.getDefaultEnsTextRecord(
                state.connection.provider,
                props.account.ensName,
            );
        } else {
            return;
        }
    };

    useAsync(
        getTextRecords,
        (data: unknown) => {
            setEnsTextRecords(data as EnsTextRecords | undefined);
        },
        [
            state.accounts.selectedContact,
            state.connection.account,
            state.accounts.accountInfoView,
        ],
    );

    const publishProfileOnchain = async () => {
        setPublishButtonState(ButtonState.Loading);
        try {
            const tx = await Lib.account.publishProfileOnchain(
                state.connection,
                state.connection.defaultServiceUrl +
                    '/profile/' +
                    state.connection.account!.ensName,
            );

            if (tx) {
                const response = await Lib.external.executeTransaction(tx);
                await response.wait();
                setPublishButtonState(ButtonState.Success);
            } else {
                throw Error('Error creating publish transaction');
            }
        } catch (e) {
            Lib.log(e as string);
            setPublishButtonState(ButtonState.Failed);
        }
    };

    return (
        <div className="user-info">
            <div className="row row-space-sm pb-4">
                <div className="col text-center">
                    <Avatar
                        ensName={props.account.ensName}
                        specialSize={SpecialSize.Md}
                    />
                </div>
            </div>

            <div className="row mt-4 user-info-row ">
                <div className="col-2 d-flex">
                    <button
                        type="button"
                        className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                        disabled
                    >
                        <Icon iconClass="fab fa-ethereum fa-2x" />
                    </button>
                </div>
                <div className="col-10 info-value d-flex">
                    <div className="align-self-center">
                        <a
                            className="text-decoration-none "
                            href={
                                'https://etherscan.io/address/' +
                                props.account.ensName
                            }
                            target="_blank"
                        >
                            {props.account.ensName}
                        </a>
                    </div>
                </div>
            </div>
            {ensTextRecords?.email && (
                <div className="row user-info-row ">
                    <div className="col-2 d-flex">
                        <button
                            type="button"
                            className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="far fa-envelope fa-2x" />
                        </button>
                    </div>
                    <div className="col-10 info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none "
                                href={'mailto://' + ensTextRecords?.email}
                                target="_blank"
                            >
                                {ensTextRecords?.email}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.url && (
                <div className="row  user-info-row">
                    <div className="col-2 d-flex">
                        <button
                            type="button"
                            className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fas fa-link fa-2x" />
                        </button>
                    </div>
                    <div className="col-10  info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none "
                                href={ensTextRecords?.url}
                                target="_blank"
                            >
                                {ensTextRecords?.url}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.github && (
                <div className="row user-info-row">
                    <div className="col-2 d-flex">
                        <button
                            type="button"
                            className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fab fa-github fa-2x" />
                        </button>
                    </div>
                    <div className="col-10  info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none "
                                href={
                                    'https://github.com/' +
                                    ensTextRecords?.github
                                }
                                target="_blank"
                            >
                                @{ensTextRecords?.github}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.twitter && (
                <div className="row user-info-row">
                    <div className="col-2 r d-flex">
                        <button
                            type="button"
                            className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fab fa-twitter fa-2x" />
                        </button>
                    </div>
                    <div className="col-10  info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none  align-self-center"
                                href={
                                    'https://twitter.com/' +
                                    ensTextRecords?.twitter
                                }
                                target="_blank"
                            >
                                @{ensTextRecords?.twitter}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {props.account.profile && (
                <div className="row user-info-row">
                    <div className="col-2 d-flex">
                        <button
                            type="button"
                            className="ms-auto right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fas fa-lock fa-2x" />
                        </button>
                    </div>
                    <div className="col-10  info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none  align-self-center"
                                href={
                                    deliveryServiceUrl +
                                    '/profile/' +
                                    props.account.ensName
                                }
                                target="_blank"
                            >
                                {deliveryServiceUrl +
                                    '/profile/' +
                                    props.account.ensName}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {props.account.ensName && (
                <div className="row row-space">
                    <div className="col-12 ">
                        <a
                            href={`https://app.ens.domains/name/${props.account.ensName}/details`}
                            target="_blank"
                            type="button"
                            className={`w-100 btn btn-lg btn-outline-secondary right-state-button`}
                        >
                            {state.accounts.accountInfoView ===
                            AccountInfo.Account
                                ? 'Edit'
                                : 'Show'}{' '}
                            ENS Info
                        </a>
                    </div>
                </div>
            )}
            {state.accounts.accountInfoView === AccountInfo.Account && (
                <div className="row row-space ">
                    <div className="col-12 ">
                        <StateButton
                            btnState={publishButtonState}
                            btnType="secondary"
                            onClick={publishProfileOnchain}
                            content={<>Publish Profile</>}
                            className=""
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserInfo;
