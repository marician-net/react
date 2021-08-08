/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import Button from '@components/buttons/button';
import TextButton from '@components/buttons/text-button';
import Timer from '@components/timer';
import { PRODUCTS } from '@constants/router-constants';
import {
  openRaiseModal,
  openWithdrawModal,
  openPlaceBidModal,
  openConnectMetamaskModal,
} from '@actions/modals.actions';
import {
  HISTORY_BID_PLACED_EVENT,
  HISTORY_BID_WITHDRAWN_EVENT,
} from '@constants/history.constants';
import { convertToEth } from '@helpers/price.helpers';
import { getAuctionById } from '@selectors/auction.selectors';
import { getHistoryByTokenId } from '@selectors/history.selectors';
import { getAccount } from '@selectors/user.selectors';
import {
  getExchangeRateETH,
  getMinBidIncrement,
  getBidWithdrawalLockTime,
} from '@selectors/global.selectors';
import { useAPY } from '@hooks/apy.hooks';

import styles from './styles.module.scss';

const ImportantProductInformation = ({
  clothesId,
  estimateApyText,
  buttonTextPlace,
  buttonTextRaise,
  buttonTextWithdraw,
  expirationDateText,
  styleTypeBlock,
  hintText,
}) => {
  const dispatch = useDispatch();
  const account = useSelector(getAccount);

  const auction = useSelector(getAuctionById(clothesId));
  const history = useSelector(getHistoryByTokenId(clothesId));
  const exchangeRateETH = useSelector(getExchangeRateETH);
  const minBidIncrement = useSelector(getMinBidIncrement);
  const bidWithdrawalLockTime = useSelector(getBidWithdrawalLockTime);
  const [isShowHint, setIsShowHint] = useState(false);

  const estimateApy = useAPY(auction ? auction.topBid : 0);

  const [, updateState] = React.useState(0);
  const timer = useRef(null);
  const timerToSoldButton = useRef(null);
  let canShowWithdrawBtn = false;
  let showSoldButton = false;

  clearTimeout(timer.current);
  clearTimeout(timerToSoldButton.current);

  useEffect(() => {
    clearTimeout(timer.current);
    clearTimeout(timerToSoldButton.current);
  }, []);

  if (!auction) {
    return null;
  }

  const priceEth = convertToEth(auction.topBid);
  const minBid = new BigNumber(priceEth).plus(new BigNumber(minBidIncrement));
  const expirationDate = auction.endTime * 1000;

  const timeOut = new Date(expirationDate) - new Date() + 1000;

  const fullCollection = [
    { id: '39', text: 'View All Collection' },
    { id: '40', text: 'View All Collection' },
    { id: '41', text: 'View All Collection' },
    { id: '42', text: 'View All Collection' },
  ];

  if (timeOut > 0) {
    timerToSoldButton.current = setTimeout(
      () => updateState(Date.now()),
      timeOut,
    );
  } else {
    showSoldButton = true;
  }

  const sortedHistory = history
    .filter(
      (item) => account
        && item.bidder
        && [HISTORY_BID_WITHDRAWN_EVENT, HISTORY_BID_PLACED_EVENT].includes(
          item.eventName,
        ),
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  let isMakeBid = false;
  let withdrawValue = 0;

  if (!showSoldButton && sortedHistory.length) {
    const lastEvent = sortedHistory[0];

    if (
      lastEvent.bidder.id.toLowerCase() === account.toLowerCase()
      && lastEvent.eventName === HISTORY_BID_PLACED_EVENT
    ) {
      const timeDiff = Date.now() - lastEvent.timestamp * 1000;

      if (timeDiff > 0 && timeDiff / 1000 >= bidWithdrawalLockTime) {
        canShowWithdrawBtn = true;
      } else if (bidWithdrawalLockTime - timeDiff / 1000 > 0) {
        timer.current = setTimeout(
          () => updateState(Date.now()),
          (bidWithdrawalLockTime - timeDiff / 1000) * 1000,
        );
      }

      withdrawValue = lastEvent.value;
    }

    const mySortedHistory = sortedHistory.filter(
      (item) => account
        && item.bidder
        && item.bidder.id.toLowerCase() === account.toLowerCase(),
    );

    if (mySortedHistory.length) {
      const myLastEvent = mySortedHistory[0];

      isMakeBid = !!mySortedHistory.find(
        (item) => item.eventName === HISTORY_BID_PLACED_EVENT,
      );

      if (myLastEvent.eventName === HISTORY_BID_PLACED_EVENT) {
        withdrawValue = myLastEvent.value;
      }
    }
  }

  const handleClickPlaceBid = () => {
    if (account) {
      dispatch(openPlaceBidModal({ id: clothesId, priceEth }));
    } else {
      dispatch(openConnectMetamaskModal());
    }
  };

  const handleClickRaiseBid = () => {
    dispatch(
      openRaiseModal({
        id: clothesId,
        priceEth,
        withdrawValue: convertToEth(withdrawValue),
      }),
    );
  };

  const handleClickWithdrawBid = () => {
    dispatch(
      openWithdrawModal({
        id: clothesId,
        withdrawValue: convertToEth(withdrawValue),
      }),
    );
  };

  const getPriceUsd = (valueEth) => {
    const priceUsd = valueEth * exchangeRateETH;
    return (Math.trunc(priceUsd * 100) / 100).toLocaleString('en');
  };

  return (
    <div
      className={cn({
        [styles.smallWhite]: styleTypeBlock === 'smallWhite',
        [styles.largeTransparent]: styleTypeBlock === 'largeTransparent',
      })}
    >
      <div className={styles.leftWrapper}>
        <p className={styles.priceWrapper}>
          <span className={styles.priceEth}>{priceEth} Ξ</span>
          <span className={styles.priceUsd}>(${getPriceUsd(priceEth)})</span>
        </p>
        <p className={styles.estimateWrapper}>
          <span className={styles.estimateApy}>{estimateApy}%</span>
          <span className={styles.estimateApyTextWrapper}>
            <span className={styles.estimateApyText}>{estimateApyText}</span>
            <span
              onMouseEnter={() => setIsShowHint(true)}
              onMouseLeave={() => setIsShowHint(false)}
              className={styles.questionMark}
            >
              ?
            </span>
          </span>
          {isShowHint && <span className={styles.hint}>{hintText}</span>}
        </p>
      </div>
      {styleTypeBlock === 'smallWhite' && (
        <div className={styles.linkStyle}>
          {fullCollection.find((link) => link.id === clothesId) ? (
            <Link href={`${PRODUCTS}${clothesId}`}>
              {fullCollection.find((link) => link.id === clothesId).text}
            </Link>
          ) : null}
        </div>
      )}
      <div className={styles.footerBoxRight}>
        <Timer className={styles.timer} expirationDate={expirationDate} />
        <p className={styles.expirationDateText}>{expirationDateText}</p>
        {!showSoldButton ? (
          <>
            {isMakeBid && priceEth > 0 ? (
              <Button
                onClick={() => handleClickRaiseBid()}
                className={styles.button}
                background="black"
              >
                <span className={styles.buttonText}>{buttonTextRaise}</span>
                {styleTypeBlock === 'largeTransparent' && (
                  <span className={styles.buttonGray}>
                    (need min {minBid.toString(10)}Ξ to compete)
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleClickPlaceBid()}
                className={styles.button}
                background="black"
              >
                <span className={styles.buttonText}>{buttonTextPlace}</span>
                {styleTypeBlock === 'largeTransparent' && (
                  <span className={styles.buttonGray}>
                    (need min {minBid.toString(10)}Ξ to compete)
                  </span>
                )}
              </Button>
            )}
            {canShowWithdrawBtn && (
              <div className={styles.wrapperButtonWithdraw}>
                <TextButton onClick={() => handleClickWithdrawBid()}>
                  {buttonTextWithdraw}
                </TextButton>
              </div>
            )}
          </>
        ) : (
          <Button className={styles.buttonSold} background="black">
            <span>SOLD</span>
          </Button>
        )}
      </div>
    </div>
  );
};

ImportantProductInformation.propTypes = {
  clothesId: PropTypes.string.isRequired,
  estimateApyText: PropTypes.string,
  buttonTextPlace: PropTypes.string,
  buttonTextRaise: PropTypes.string,
  buttonTextWithdraw: PropTypes.string,
  expirationDateText: PropTypes.string,
  styleTypeBlock: PropTypes.oneOf(['smallWhite', 'largeTransparent']),
  hintText: PropTypes.string,
};

ImportantProductInformation.defaultProps = {
  estimateApyText: 'Estimate APY',
  buttonTextPlace: 'Place a Bid',
  buttonTextRaise: 'Raise a Bid',
  buttonTextWithdraw: 'Withdraw a Bid',
  expirationDateText: 'Time left',
  styleTypeBlock: 'smallWhite',
  hintText: `APY estimated based on the current total staked value across each of the $MONA 
  reward pools and current highest bid value of the NFT.`,
};

export default ImportantProductInformation;
