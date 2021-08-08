import React, { memo, useEffect, useMemo } from 'react';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import { getAllDesigners, getAllDesignerCIDs } from '@selectors/designer.selectors';
import styles from './styles.module.scss';
import DesignerCard from './designer-card';

const DesignerList = () => {
  // const designerList = useSelector(getAllDesigners());
  const designerCIDs = useSelector(getAllDesignerCIDs());

  // const sortedList = useMemo(
  //   () => designerList
  //     .toJS()
  //     .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)),
  //   [designerList],
  // );
  return (
    <div className={cn(styles.wrapper)}>
      <img src="/images/global_designers.png" className="px-5" />
      <img src="/images/network.png" className="ml-10"/>
      <div className={styles.container}>
        { designerCIDs.map((cid) => <DesignerCard cid={cid} />) }
        {/* {sortedList.map((item) => (
          <DesignerCard
            key={item.id}
            name={item.designerName}
            photo={item.designerPhoto}
            country={item.designerCountry}
            countryIcon={item.designerCountryFlagIcon}
            socials={item.designerSocialMedia}
          />
        ))} */}
      </div>
    </div>
  );
};

export default memo(DesignerList);
