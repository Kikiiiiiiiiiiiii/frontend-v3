import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import {
  Input,
  message,
  Row,
  Col,
  Spin,
  Button,
  Pagination,
} from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { multiLevelShare } from "../../api/index";
import { getShareHost, changeTime } from "../../utils/index";
import { Empty } from "../../components";
import { WithdrawDialog } from "./components/withdraw-dialog";

export const SharePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogStatus, setDialogStatus] = useState<boolean>(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [count, setCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [projectType, setProjectType] = useState(1);
  const [rules, setRules] = useState<string>("");
  const [list, setList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [courses, setCourses] = useState<any>([]);
  const [page2, setPage2] = useState(1);
  const [size2, setSize2] = useState(9);
  const [total2, setTotal2] = useState(0);
  const [refresh2, setRefresh2] = useState(false);
  const user = useSelector((state: any) => state.loginUser.value.user);
  const tabs = [
    {
      name: "分销课程",
      id: 1,
    },
    {
      name: "资金明细",
      id: 2,
    },
  ];

  useEffect(() => {
    setList([]);
    if (projectType === 2) {
      getData();
    }
  }, [refresh, page, size, projectType]);

  useEffect(() => {
    setCourses([]);
    if (projectType === 1) {
      getGoods();
    }
  }, [refresh2, page2, size2, projectType]);

  useEffect(() => {
    getInviteInfo();
    getShareConfig();
  }, [user]);

  const getInviteInfo = () => {
    multiLevelShare.user().then((res: any) => {
      setCount(res.data.invite_count);
      setBalance(res.data.invite_balance);
      let url = getShareHost() + "?msv=" + user.id;
      setInviteUrl(url);
    });
  };

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    multiLevelShare
      .inviteBalanceRecords({
        page: page,
        size: size,
      })
      .then((res: any) => {
        setList(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      });
  };

  const getGoods = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    multiLevelShare
      .goods({
        page: page2,
        size: size2,
      })
      .then((res: any) => {
        setCourses(res.data.data.data);
        setTotal2(res.data.data.total);
        setLoading(false);
      });
  };

  const getShareConfig = () => {
    multiLevelShare.config().then((res: any) => {
      setRules(res.data.rules);
    });
  };

  const copy = () => {
    var input = document.createElement("input");
    input.value = inviteUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    document.body.removeChild(input);
    message.success("复制成功");
  };

  const goPoster = (goods: any) => {
    let shareLink;
    if (goods.goods_type === "practice") {
      shareLink =
        getShareHost() +
        "exam/practice/detail?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    } else if (goods.goods_type === "paper") {
      shareLink =
        getShareHost() +
        "exam/papers/detail?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    } else if (goods.goods_type === "topic") {
      shareLink =
        getShareHost() +
        "topic/detail?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    } else if (goods.goods_type === "learnPath") {
      shareLink =
        getShareHost() +
        "learnPath/detail?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    } else if (goods.goods_type === "book") {
      shareLink =
        getShareHost() + "book/detail?id=" + goods.goods_id + "&msv=" + user.id;
    } else if (goods.goods_type === "live") {
      shareLink =
        getShareHost() + "live/detail?id=" + goods.goods_id + "&msv=" + user.id;
    } else if (goods.goods_type === "video") {
      shareLink =
        getShareHost() +
        "courses/video?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    } else if (goods.goods_type === "vip") {
      shareLink = getShareHost() + "vip" + "?msv=" + user.id;
    } else if (goods.goods_type === "ms") {
      shareLink =
        getShareHost() + "ms/detail?id=" + goods.goods_id + "&msv=" + user.id;
    } else if (goods.goods_type === "tg") {
      shareLink =
        getShareHost() + "tg/detail?id=" + goods.goods_id + "&msv=" + user.id;
    } else {
      shareLink =
        getShareHost() +
        "courses/detail?id=" +
        goods.goods_id +
        "&msv=" +
        user.id;
    }
    var input = document.createElement("input");
    input.value = shareLink;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    document.body.removeChild(input);
    message.success("复制成功");
  };

  return (
    <div className="container">
      <WithdrawDialog
        open={dialogStatus}
        balance={balance}
        onCancel={() => setDialogStatus(false)}
        onSuccess={() => {
          getInviteInfo();
          setList("");
          setPage(1);
          getData();
          setDialogStatus(false);
        }}
      ></WithdrawDialog>
      <div className={styles["box"]}>
        <div className={styles["user-box"]}>
          <div className={styles["user"]}>
            <div className={styles["avatar"]}>
              <img src={user.avatar} />
            </div>
            <div className={styles["user-info"]}>
              <div className={styles["user-name"]}>{user.nick_name}</div>
              <div className={styles["share-box"]}>
                <Input
                  value={inviteUrl}
                  onChange={(e) => {
                    setInviteUrl(e.target.value);
                  }}
                  className={styles["input"]}
                ></Input>
                <Button className={styles["btn-copy"]} onClick={() => copy()}>
                  复制邀请链接
                </Button>
              </div>
            </div>
          </div>
          <div className={styles["item-box"]}>
            <div className={styles["value"]}>{count}</div>
            <div className={styles["tit"]}>邀请人数</div>
          </div>
          <div className={styles["item-box"]}>
            <div className={styles["value"]}>
              <span>{balance}</span>
            </div>
            <div className={styles["tit"]}>邀请余额</div>
          </div>
          <div
            className={styles["withdraw-button"]}
            onClick={() => {
              if (balance === 0) {
                message.error("余额为0时不可提现");
                return;
              }
              setDialogStatus(true);
            }}
          >
            提现
          </div>
        </div>
        <div className={styles["bottom-box"]}>
          <div className={styles["project-box"]}>
            <div className={styles["btns"]}>
              {tabs.map((item: any) => (
                <div
                  key={item.id}
                  className={
                    projectType === item.id
                      ? styles["active-btn-title"]
                      : styles["btn-title"]
                  }
                  onClick={() => setProjectType(item.id)}
                >
                  {item.name}
                  {projectType === item.id && (
                    <div className={styles["baseline"]}></div>
                  )}
                </div>
              ))}
            </div>
            {loading && (
              <Row>
                <div className="float-left d-j-flex mt-50">
                  <Spin size="large" />
                </div>
              </Row>
            )}
            {!loading && projectType === 1 && courses.length === 0 && (
              <Col span={24}>
                <Empty></Empty>
              </Col>
            )}
            {!loading && projectType === 1 && courses.length > 0 && (
              <div className={styles["goods-box"]}>
                {courses.map((item: any) => (
                  <div className={styles["goods-item"]} key={item.id}>
                    <div className={styles["goods-thumb"]}>
                      <img src={item.goods_thumb} />
                    </div>
                    <div className={styles["goods-info"]}>
                      <div className={styles["goods-title"]}>
                        {item.goods_title}
                      </div>
                      <div className={styles["goods-charge"]}>
                        <div className={styles["reward"]}>
                          邀新用户下单可赚{item.reward}元
                        </div>
                        <div
                          className={styles["poster-button"]}
                          onClick={() => goPoster(item)}
                        >
                          复制链接
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading &&
              courses.length > 0 &&
              projectType === 1 &&
              size2 < total2 && (
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 50,
                  }}
                >
                  <Pagination
                    onChange={(currentPage) => {
                      setPage2(currentPage);
                      window.scrollTo(0, 0);
                    }}
                    pageSize={size2}
                    defaultCurrent={page2}
                    total={total2}
                  />
                </Col>
              )}
            {!loading && projectType === 2 && list.length === 0 && (
              <Col span={24}>
                <Empty></Empty>
              </Col>
            )}
            {!loading &&
              projectType === 2 &&
              list.length > 0 &&
              list.map((item: any, index: number) => (
                <div className={styles["project-item"]} key={index}>
                  <div className={styles["title"]}>{item.remark}</div>
                  <div className={styles["price"]}>{item.amount}元</div>
                  <div className={styles["info"]}>
                    <span>{changeTime(item.created_at)}</span>
                  </div>
                </div>
              ))}
            {!loading &&
              list.length > 0 &&
              projectType === 2 &&
              size < total && (
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 50,
                  }}
                >
                  <Pagination
                    onChange={(currentPage) => {
                      setPage(currentPage);
                      window.scrollTo(0, 0);
                    }}
                    pageSize={size}
                    defaultCurrent={page}
                    total={total}
                  />
                </Col>
              )}
          </div>
          <div className={styles["info-box"]}>
            <div className={styles["tit"]}>分销课程说明</div>
            <div className={styles["line"]}></div>
            <div
              className={styles["desc"]}
              dangerouslySetInnerHTML={{ __html: rules }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
