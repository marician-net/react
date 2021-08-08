import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Router, { useRouter }  from 'next/router';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import cn from 'classnames';
import Link from 'next/link';
import Button from '@components/buttons/button';
import SmallPhotoWithText from '@components/small-photo-with-text';
import { getUser } from '@selectors/user.selectors';
import { openConnectMetamaskModal } from '@actions/modals.actions';
import accountActions from '@actions/user.actions';
import Logo from './logo';
import LandingHeader from './landing';
import Icon from "@material-ui/core/Icon";
import styles from './styles.module.scss';

const HeaderTopLine = ({ className, isShowStaking, buttonText, linkText }) => {
  
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isCollapse, setIsCollapse] = useState(false)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const offset = 0
      const { scrollTop } = document.documentElement
      const scrolled = scrollTop > offset

      if (hasScrolled !== scrolled) {
        setHasScrolled(scrolled)
      }
    }, 200)

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [hasScrolled])

  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user) {
    dispatch(accountActions.checkStorageAuth());
  }

  const handleClick = () => dispatch(openConnectMetamaskModal());
  const onIconHander = () => {
    setIsCollapse(!isCollapse);
  };

  const [isShowMenu, setIsShowMenu] = useState(false);

  const router = useRouter();
  const pathname = router.pathname;

  const isLandingPage = pathname === '/';

  const handleProfileClick = () => {
    setIsShowMenu(false);
    Router.push('/profile');
  };
  const handleLogoutClick = () => {
    setIsShowMenu(false);
    dispatch(accountActions.logout());
  };

  // return isLandingPage ? (
  //   <LandingHeader/>
  // ) : (...)
  return (
    <div className={cn(className, styles.wrapper, hasScrolled?styles.floatingNav:'')}>
      <div className={styles.leftBox}>
        <Logo />
        {/* <a href="https://skins.digitalax.xyz/" className={styles.goToMaticButton}>
          Switch to Matic for ESPA
        </a> */}
        {/* <div className={styles.arrow}>
          <img src="images/arrow.svg"  />
          <span className={styles.arrowDesc}>Switch for ESPA and Among Us Mod Drop</span>
        </div> */}
      </div>
      <div className={styles.rightBox}>
        <div className={cn(styles.links, isCollapse?styles.expandedMenu:'')}>
          {/* <Link href="/">
            <a className={styles.link}>Auctions</a>
          </Link>
          <Link href="/sold">
            <a className={styles.link}>Previously Sold</a>
          </Link> */
          /* <a
            href="https://pode.digitalax.xyz/"
            className={styles.link}
            target="_blank"
            rel="noreferrer"
          >
            PODE
          </a> */          
          /* <a
            href="https://medium.com/@digitalax"
            className={styles.link}
            target="_blank"
            rel="noreferrer"
          >
            Blog
          </a>
          <a
            href="https://community.digitalax.xyz/"
            className={styles.link}
            target="_blank"
            rel="noreferrer"
          >
            Forum
          </a>
          {isShowStaking && (
            <a
              href="http://staking.digitalax.xyz/"
              className={styles.link}
              target="_blank"
              rel="noreferrer"
            >
              {linkText}
            </a>
          )} */}
          <Link href="https://skins.digitalax.xyz">
            <a className={styles.link} target="_blank">
              SUIT UP IN YOUR GAME SKINS
            </a>
          </Link>
          <Link href="https://drip.digitalax.xyz">
            <a className={styles.link} target="_blank">
              REP YOUR STLE IRL 
            </a>
          </Link>
          <Link href="/global">
            <a className={styles.link}>Global Designer Network</a>
          </Link>
          <Link href="http://staking.digitalax.xyz/">
            <a className={styles.link}>STAKE YOUR FASHION</a>
          </Link>
          <div className={styles.signBtn}>
            {user ? (
              <div className={styles.buttonWrapper}>
                <SmallPhotoWithText
                  photo={user.get('avatar') ? user.get('avatar') : './images/user-photo.svg'}
                  address={user.get('username')}
                  className={styles.hashAddress}
                >
                  <button className={styles.arrowBottom} onClick={() => setIsShowMenu(!isShowMenu)}>
                    <img
                      className={styles.arrowBottomImg}
                      src="./images/icons/arrow-bottom.svg"
                      alt="arrow-bottom"
                    />
                    {/* <Icon style={{color: "#FF77F1"}}>expand_more</Icon> */}
                  </button>
                </SmallPhotoWithText>
                {isShowMenu && (
                  <div className={styles.menuWrapper}>
                    <button onClick={() => handleProfileClick()} className={styles.menuButton}>
                      Profile
                    </button>
                    <button onClick={() => handleLogoutClick()} className={styles.menuButton}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => handleClick()}>{buttonText}</Button>
            )}
          </div>
          <a href="javascript:void(0);" className={styles.collapseIcon} onClick={onIconHander}>&#9776;</a>
        </div>
      </div>
    </div>
  );
};

HeaderTopLine.propTypes = {
  className: PropTypes.string,
  isShowStaking: PropTypes.bool,
  buttonText: PropTypes.string,
  linkText: PropTypes.string,
};

HeaderTopLine.defaultProps = {
  className: '',
  isShowStaking: true,
  buttonText: 'SIGN IN',
  linkText: 'Staking',
};

export default HeaderTopLine;
