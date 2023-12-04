import { ArrowRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BalanceBox from "~/app/components/BalanceBox";
import Hyperlink from "~/app/components/Hyperlink";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useTransactions } from "~/app/hooks/useTransactions";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { Battery } from "~/types";

dayjs.extend(relativeTime);

export type Props = {
  lnDataFromCurrentTab?: Battery[];
  currentUrl?: URL | null;
  renderPublisherWidget?: boolean;
};

const DefaultView: FC<Props> = (props) => {
  const itemsLimit = 8;

  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();

  const { account, accountLoading } = useAccount();

  const lightningAddress = account?.lightningAddress || "";

  const [isBlockedUrl, setIsBlockedUrl] = useState<boolean>(false);

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const isLoading = accountLoading || isLoadingTransactions;

  useEffect(() => {
    loadTransactions(itemsLimit);
  }, [loadTransactions, itemsLimit, account?.id]);

  // check if currentURL is blocked
  useEffect(() => {
    const checkBlockedUrl = async (host: string) => {
      const { blocked } = await api.getBlocklist(host);
      setIsBlockedUrl(blocked);
    };

    if (props.currentUrl?.host) {
      checkBlockedUrl(props.currentUrl.host);
    }
  }, [props.currentUrl]);

  const unblock = async () => {
    try {
      if (props.currentUrl?.host) {
        await msg.request("deleteBlocklist", {
          host: props.currentUrl.host,
        });
        toast.success(
          t("default_view.block_removed", { host: props.currentUrl.host })
        );
      }
      setIsBlockedUrl(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  };

  function handleViewAllLink(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#${path}`);
    } else {
      navigate(path);
    }
  }

  return (
    <div className="w-full max-w-screen-sm h-full mx-auto overflow-y-auto no-scrollbar">
      {props.renderPublisherWidget && !!props.lnDataFromCurrentTab?.length && (
        <PublisherLnData lnData={props.lnDataFromCurrentTab[0]} />
      )}
      <div className="p-4">
        <BalanceBox />
        {(accountLoading || lightningAddress) && (
          <div className="flex justify-center">
            <a
              className="cursor-pointer flex flex-row items-center mb-6 px-3 py-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none"
              onClick={() => {
                navigator.clipboard.writeText(lightningAddress);
                toast.success(tCommon("actions.copied_to_clipboard"));
              }}
            >
              {accountLoading && (
                <>
                  ⚡️&nbsp;
                  <SkeletonLoader className="w-32" />
                </>
              )}
              {!accountLoading && (
                <>
                  <span>⚡️ {lightningAddress}</span>
                </>
              )}
            </a>
          </div>
        )}
        <div className="mb-4 gap-2 grid grid-cols-4">
          <HomeButton text={tCommon("actions.receive")} />
          <HomeButton text={tCommon("actions.send")} />
          <HomeButton text={"Apps"} />
          <HomeButton text={"Buy"} />
          {/* <Button
            fullWidth
            icon={<ReceiveIcon className="w-6 h-6" />}
            label={tCommon("actions.receive")}
            direction="column"
            onClick={() => {
              navigate("/receive");
            }}
          />

          <Button
            fullWidth
            icon={<SendIcon className="w-6 h-6" />}
            label={tCommon("actions.send")}
            direction="column"
            onClick={() => {
              navigate("/send");
            }}
          /> */}
        </div>

        {isBlockedUrl && (
          <div className="mb-2 items-center py-3 dark:text-white">
            <p className="py-1">
              {t("default_view.is_blocked_hint", {
                host: props.currentUrl?.host,
              })}
            </p>
            <Button
              fullWidth
              label={t("actions.enable_now")}
              direction="column"
              onClick={() => unblock()}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {!isLoading && (
          <div>
            <TransactionsTable
              transactions={transactions}
              loading={isLoading}
              noResultMsg={t("default_view.no_transactions")}
            />

            {!isLoading && transactions.length > 0 && (
              <div className="text-center">
                <Hyperlink
                  onClick={() => handleViewAllLink("/transactions")}
                  className="flex justify-center items-center mt-2"
                >
                  {t("default_view.see_all")}
                  <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Hyperlink>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultView;

const HomeButton = ({ text }: { text: React.ReactNode }) => (
  <button className="rounded-xl space-y-2 text-xs font-medium p-4 flex flex-col items-center bg-white dark:bg-surface-06dp hover:bg-gray-50 dark:hover:bg-surface-08dp text-gray-800 dark:text-neutral-200 border border-gray-200 dark:border-gray-700">
    <ArrowRightIcon className="w-6 h-6 text-primary" />
    <span>{text}</span>
  </button>
);
