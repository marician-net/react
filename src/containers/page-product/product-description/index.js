import React, { memo, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTokenInfo } from '@hooks/token.info.hooks';
import { getGarmentsById, getGarmentsReceiveByName } from '@selectors/garment.selectors';
import { getDesignerInfoById } from '@selectors/designer.selectors';
import { createArrayForGallery } from '@helpers/photo.helpers';
import { COMMON_RARITY, SEMI_RARE_RARITY } from '@constants/global.constants';
import LeftBox from './left-box';
import RightBox from './right-box';
import styles from './styles.module.scss';

const ProductDescription = ({
  clothesId,
  currentCollections,
  currentMarketplaceOffers,
  activeTab,
  setActiveTab,
  isInCollectionOne
}) => {
  const garment = useSelector(getGarmentsById(clothesId));
  const tokenUri = useMemo(() => {
    if (activeTab === 0) {
      return garment.tokenUri;
    }
    if (activeTab === 1) {
      const t_semiRare = currentCollections.find(
        (collection) => collection.rarity === SEMI_RARE_RARITY
      );
      return t_semiRare ? t_semiRare.garments[0].tokenUri : '';
    }
    const t_common = currentCollections.find((collection) => collection.rarity === COMMON_RARITY);
    return t_common ? t_common.garments[0].tokenUri : '';
  }, [activeTab, currentCollections]);
  const tokenInfo = useTokenInfo(tokenUri, [tokenUri]);
  const clothesPhotos = useMemo(() => createArrayForGallery(tokenInfo), [tokenInfo]);
  const currentDesignersInfo = useSelector(getDesignerInfoById(garment.designer));
  const receive = useSelector(getGarmentsReceiveByName(tokenInfo?.name));

  const currentCounts = useMemo(() => {
    const t_semiRare_offer = currentMarketplaceOffers.find(
      (offer) => offer.garmentCollection.rarity === SEMI_RARE_RARITY
    );
    const t_common_offer = currentMarketplaceOffers.find(
      (offer) => offer.garmentCollection.rarity === COMMON_RARITY
    );
    const t_semiRare = t_semiRare_offer
      ? currentCollections.find((collection) => collection.id === t_semiRare_offer.id)
      : null;
    const t_common = t_common_offer
      ? currentCollections.find((collection) => collection.id === t_common_offer.id)
      : null;

    return [
      { total: 1, sold: !garment.resulted ? 0 : 1 },
      {
        total: t_semiRare ? t_semiRare.garments.length : 0,
        collectionId: t_semiRare ? t_semiRare.id : null,
        basePrice: t_semiRare_offer ? t_semiRare_offer.primarySalePrice : '0',
        sold: t_semiRare_offer ? parseInt(t_semiRare_offer.amountSold, 10) : 0,
      },
      {
        total: t_common ? t_common.garments.length : 0,
        collectionId: t_common ? t_common.id : null,
        basePrice: t_common_offer ? t_common_offer.primarySalePrice : '0',
        sold: t_common_offer ? parseInt(t_common_offer.amountSold, 10) : 0,
      },
    ];
  }, [currentCollections, currentMarketplaceOffers]);

  // pull designer informations and cloth photos for all rare types
  // IMPORTANT relationships between nfts :(

  const currentClothesInfo = {
    clothesId,
    clothesName: tokenInfo && tokenInfo.name ? tokenInfo.name : `ID: ${clothesId}`,
    description: tokenInfo && tokenInfo.description ? tokenInfo.description : `ID: ${clothesId}`,
    estimateApy: 127,
    youReceive: receive?.receive
      ? receive.receive
      : parseInt(clothesId, 10) > 43
      ? 'Graphic, DressX Try On, Material Component, Decentraland Skin'
      : 'Graphic, FBX, Material Component',
    valueChildNfts: 'ERC1155',
    valueApy: '',
  };

  return (
    <div className={styles.wrapper}>
      <LeftBox
        {...currentClothesInfo}
        currentCounts={currentCounts}
        clothesPhotos={clothesPhotos}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <RightBox
        clothesId={clothesId}
        isInCollectionOne={isInCollectionOne}
        currentCounts={currentCounts}
        currentClothesInfo={currentClothesInfo}
        currentDesignersInfo={currentDesignersInfo}
        activeTab={activeTab}
        currentCollections={currentCollections}
      />
    </div>
  );
};

ProductDescription.propTypes = {
  clothesId: PropTypes.string.isRequired,
  designerId: PropTypes.string.isRequired,
  activeTab: PropTypes.number.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default memo(ProductDescription);
