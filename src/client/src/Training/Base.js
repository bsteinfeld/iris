import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Training from './Training'
import DropDown, { ProfileDropDown } from 'common/DropDown/DropDown'
import { setActiveAccount } from 'redux/accounts'
import { setActiveWMLResource } from 'redux/wmlResources'

import queryString from 'query-string'

import styles from './TitleBar.module.css'
import globalHistory from 'globalHistory'
import { useGoogleAnalytics } from 'googleAnalyticsHook'

const PANEL_WIDTH = '270px'

const accountNameForAccount = (account) => {
  if (account && account.softlayer) {
    return `${account.softlayer} - ${account.name}`
  } else if (account) {
    return account.name
  }
}

const mapStateToProps = (state) => ({
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource,
  accounts: state.accounts.accounts,
  activeAccount: state.accounts.activeAccount,
  buckets: state.buckets,
  profile: state.profile,
})

const StatusListItem = ({ children, status }) => {
  if (status === 'completed') {
    return <div className={styles.listItemSuccess}>{children}</div>
  }
  if (status === 'error' || status === 'failed') {
    return <div className={styles.listItemError}>{children}</div>
  }
  if (status === 'canceled') {
    return <div className={styles.listItemCanceled}>{children}</div>
  }
  return <div className={styles.listItemTraining}>{children}</div>
}

const TitleBar = connect(mapStateToProps)(
  ({
    profile,
    resources,
    activeResource,
    accounts,
    activeAccount,
    dispatch,
  }) => {
    const handleAccountChosen = useCallback(
      (item) => {
        dispatch(setActiveAccount(item))
      },
      [dispatch]
    )

    const handleResourceChosen = useCallback(
      (item) => {
        dispatch(setActiveWMLResource(item))
      },
      [dispatch]
    )

    const activeAccountObject = accounts.find(
      (account) => activeAccount === account.accountId
    )

    const activeResourceObject = resources.find(
      (resource) => activeResource === resource.id
    )

    return (
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <Link to="/" className={styles.linkOverride}>
            <span className={styles.titlePrefix}>Image and Video </span>&nbsp;&nbsp;
            Annotations
          </Link>
          {/* <span className={styles.breadCrumb}>|</span>
          Training */}
        </div>

        <nav className={styles.mainLinks}>
          {/* <a className={styles.link} href="/docs">
            Docs
          </a>
          <a
            className={styles.link}
            href="/workshops"
          >
            Workshops
          </a>
          <a className={styles.link} href="/demos">
            Demos
          </a>
          <a className={styles.link} href="/sdks">
            SDKs
          </a> */}
          {/* <Link to="/training" className={styles.activeLink}>
            Training runs
          </Link> */}
        </nav>

        <DropDown
          active={activeResourceObject && activeResourceObject.name}
          list={resources.map((resource) => ({
            display: resource.name,
            id: resource.id,
          }))}
          onChosen={handleResourceChosen}
        />
        <DropDown
          active={accountNameForAccount(activeAccountObject)}
          list={accounts.map((account) => ({
            display: accountNameForAccount(account),
            id: account.accountId,
          }))}
          onChosen={handleAccountChosen}
        />
        <ProfileDropDown profile={profile} />
      </div>
    )
  }
)

const getTrainingRunList = async (activeResourceInfo) => {
  const url = `/api/proxy/${activeResourceInfo.region_id}.ml.cloud.ibm.com/v3/models`
  const options = {
    method: 'GET',
    headers: {
      'ML-Instance-ID': activeResourceInfo.guid,
    },
  }

  const json = await fetch(url, options).then((res) => res.json())
  const resources = [...json.resources]
  resources.sort(
    (a, b) =>
      new Date(b.entity.status.submitted_at) -
      new Date(a.entity.status.submitted_at)
  )
  return resources
}

const Base = ({
  location: { search },
  loadingResources,
  resources,
  activeResource,
}) => {
  const [modelList, setModelList] = useState([])
  const [activeModel, setActiveModel] = useState(undefined)
  const [activeModelState, setActiveModelState] = useState(undefined)

  useGoogleAnalytics('training')

  useEffect(() => {
    const modelId = queryString.parse(search).model
    if (activeModel === undefined || activeModel.metadata.guid !== modelId) {
      const daModel = modelList.find((model) => model.metadata.guid === modelId)
      if (daModel) {
        setActiveModel(daModel)
        setActiveModelState(daModel.entity.status.state)
        return
      }
      if (modelList.length > 0) {
        globalHistory.replace(`/training?model=${modelList[0].metadata.guid}`)
        return
      }
      setActiveModel(undefined)
      setActiveModelState(undefined)
    }
  }, [activeModel, modelList, search])

  useEffect(() => {
    if (activeResource && resources.length > 0) {
      const activeResourceInfo = resources.find((r) => r.id === activeResource)

      const listRefresh = () => {
        getTrainingRunList(activeResourceInfo).then((resources) => {
          setModelList(resources)
          if (activeModel) {
            const modelId = activeModel.metadata.guid
            const freshActiveModel = resources.find(
              (r) => r.metadata.guid === modelId
            )
            setActiveModelState(
              freshActiveModel && freshActiveModel.entity.status.state
            )
          }
        })
      }

      listRefresh()
      // refetch list every 10 seconds.
      const id = setInterval(listRefresh, 10 * 1000)
      return () => clearInterval(id)
    }
  }, [activeModel, activeResource, resources])

  const handleModelChosen = useCallback(
    (model) => () => {
      globalHistory.replace(`/training?model=${model.metadata.guid}`)
    },
    []
  )

  const activeResourceInfo = resources.find((r) => r.id === activeResource)

  return (
    <div className={styles.wrapper}>
      <TitleBar />
      <div
        style={{
          margin: '8px',
          position: 'absolute',
          right: 0,
          top: '64px',
          // height: '48px',
          overflow: 'scroll',
          padding: `16px`,
          backgroundColor: 'var(--appBar)',
          border: '1px solid var(--textInputUnderline)',
        }}
      >
        WML v4 migration in progress. Training may be temporarily unavailable.
      </div>
      {!loadingResources && resources.length === 0 ? (
        <div className={styles.noObjectStorage}>
          <div className={styles.noBucketsTitle} style={{ marginTop: '60px' }}>
            No Machine Learning instance
          </div>
          <div className={styles.noBucketsSub}>
            We use Watson Machine Learning to train your models. You can create
            a Machine Learning instance for free on{' '}
            <a
              className={styles.getStartedLink}
              href="https://cloud.ibm.com/catalog/services/machine-learning?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
              target="_blank"
              rel="noopener noreferrer"
            >
              IBM Cloud
            </a>
            . Once created, refresh this page.
          </div>
          <a
            href="https://cloud.ibm.com/catalog/services/machine-learning?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.createBucket}
            style={{ height: '48px', marginTop: '40px' }}
          >
            <div className={styles.createBucketText}>Get started</div>
          </a>
        </div>
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              width: PANEL_WIDTH,
              top: '64px',
              bottom: '0',
              overflow: 'scroll',
              background: 'var(--secondaryBg)',
              borderRight: '1px solid var(--border)',
            }}
          >
            {modelList.map((item) => (
              <div
                key={item.metadata.guid}
                onClick={handleModelChosen(item)}
                className={
                  activeModel !== undefined &&
                  item.metadata.guid === activeModel.metadata.guid
                    ? styles.listItemActive
                    : styles.listItem
                }
              >
                <StatusListItem status={item.entity.status.state}>
                  {item.entity.model_definition.name}
                </StatusListItem>
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              left: PANEL_WIDTH,
              top: '64px',
              bottom: '0',
              overflow: 'scroll',
              width: `calc(100% - ${PANEL_WIDTH})`,
            }}
          >
            <Training
              model={activeModel}
              wmlEndpoint={
                activeResourceInfo &&
                `wss://${activeResourceInfo.region_id}.ml.cloud.ibm.com/v3/models`
              }
              wmlInstanceId={activeResourceInfo && activeResourceInfo.guid}
              status={activeModelState}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default connect((state) => ({
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource,
  loadingResources: state.wmlResources.loading,
}))(Base)
