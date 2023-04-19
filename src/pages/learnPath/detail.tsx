import React, { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Button, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { path, miaosha, tuangou } from "../../api/index";
import {
  MiaoshaDialog,
  ThumbBar,
  Empty,
  MiaoshaList,
  TuangouList,
} from "../../components";
import guideIcon from "../../assets/img/commen/icon-guidepost.png";
import paperIcon from "../../assets/img/commen/default-paper.png";

export const LearnPathDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [cid, setCid] = useState(Number(result.get("id")));
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [learn, setLearn] = useState<any>({});
  const [steps, setSteps] = useState<any>([]);
  const [msData, setMsData] = useState<any>({});
  const [msVisible, setMsVisible] = useState<boolean>(false);
  const [tgData, setTgData] = useState<any>({});
  const [hideButton, setHideButton] = useState<boolean>(false);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const config = useSelector((state: any) => state.systemConfig.value.config);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getDetail();
  }, [cid]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    path.detail(cid).then((res: any) => {
      document.title = res.data.data.name;
      setLearn(res.data.data);
      setSteps(res.data.steps);
      setIsBuy(res.data.is_buy);
      if (res.data.is_buy && configFunc["miaosha"]) {
        getMsDetail();
      } else if (!res.data.is_buy && configFunc["tuangou"]) {
        getTgDetail();
      }
    });
  };

  const getMsDetail = () => {
    if (steps.charge === 0) {
      return;
    }
    miaosha
      .detail(0, {
        course_id: cid,
        course_type: "learnPath",
      })
      .then((res: any) => {
        setMsData(res.data);
        if (!res.data.data && !isBuy && configFunc["tuangou"]) {
          getTgDetail();
        }
      });
  };
  const getTgDetail = () => {
    if (learn.charge === 0) {
      return;
    }
    tuangou
      .detail(0, {
        course_id: cid,
        course_type: "learnPath",
      })
      .then((res: any) => {
        setTgData(res.data);
        setHideButton(res.data.join_item && res.data.join_item.length !== 0);
      });
  };

  const goLogin = () => {
    navigate("/login");
  };

  const openMsDialog = () => {
    setMsVisible(true);
  };

  const goMsOrder = (id: number) => {
    navigate(
      "/order?course_id=" +
        msData.data.goods_id +
        "&course_type=" +
        msData.data.goods_type +
        "&goods_type=ms&goods_charge=" +
        msData.data.charge +
        "&goods_label=秒杀&goods_name=" +
        msData.data.goods_title +
        "&goods_id=" +
        id +
        "&goods_thumb=" +
        msData.data.goods_thumb
    );
  };

  const buyCourse = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?goods_id=" +
        cid +
        "&goods_type=path&goods_charge=" +
        learn.charge +
        "&goods_label=学习路径&goods_name=" +
        learn.name +
        "&goods_thumb=" +
        learn.thumb
    );
  };

  const goPay = (gid = 0) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?course_id=" +
        tgData.goods.other_id +
        "&course_type=" +
        tgData.goods.goods_type +
        "&goods_type=tg&goods_charge=" +
        tgData.goods.charge +
        "&goods_label=团购&goods_name=" +
        tgData.goods.goods_title +
        "&goods_id=" +
        tgData.goods.id +
        "&goods_thumb=" +
        tgData.goods.goods_thumb +
        "&tg_gid=" +
        gid
    );
  };

  const goDetail = (item: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }

    if (item.type === "course") {
      navigate("/courses/detail?id=" + item.other_id);
    } else if (item.type === "book") {
      navigate("/book/detail?id=" + item.other_id);
    } else if (item.type === "live") {
      navigate("/live/detail?id=" + item.other_id);
    } else if (item.type === "paper_practice") {
      navigate("/exam/practice/detail?id=" + item.other_id);
    } else if (item.type === "paper_paper") {
      navigate("/exam/papers/detail?id=" + item.other_id);
    }
  };

  return (
    <div className="container">
      <div className="bread-nav">
        <a
          onClick={() => {
            navigate("/");
          }}
        >
          首页
        </a>{" "}
        /
        <a
          onClick={() => {
            navigate("/learnPath");
          }}
        >
          学习路径
        </a>{" "}
        /<span>{learn.name}</span>
      </div>
      {!isBuy && msData && (
        <MiaoshaDialog
          open={msVisible}
          msData={msData}
          onCancel={() => setMsVisible(false)}
        />
      )}
      <div className={styles["book-info"]}>
        <div className={styles["book-info-box"]}>
          <div className={styles["book-thumb"]}>
            <ThumbBar
              value={learn.thumb}
              width={320}
              height={240}
              border={null}
            />
          </div>
          <div className={styles["info"]}>
            <div className={styles["book-info-title"]}>{learn.name}</div>
            <p className={styles["desc"]}>{learn.desc}</p>
            <div className={styles["btn-box"]}>
              {isBuy && <div className={styles["has-button"]}>已购买</div>}
              {learn.charge === 0 && !isBuy && (
                <div className={styles["has-button"]}>本路径免费</div>
              )}
              {!isBuy && learn.charge !== 0 && (
                <>
                  {msData && msData.data && (
                    <>
                      {msData.order && msData.order.status === 0 && (
                        <div
                          className={styles["buy-button"]}
                          onClick={() => goMsOrder(msData.order.id)}
                        >
                          已获得秒杀资格，请尽快支付
                        </div>
                      )}
                      {!msData.data.is_over && (
                        <div
                          className={styles["buy-button"]}
                          onClick={() => openMsDialog()}
                        >
                          立即秒杀￥{msData.data.charge}
                        </div>
                      )}
                    </>
                  )}
                  {(!msData || !msData.data) && (
                    <>
                      {hideButton && (
                        <div className={styles["has-button"]}>正在拼团中</div>
                      )}
                      {!hideButton && learn.charge > 0 && (
                        <div
                          className={styles["buy-button"]}
                          onClick={() => buyCourse()}
                        >
                          购买套餐￥{learn.charge}（共{learn.courses_count}
                          课程）
                        </div>
                      )}
                      {tgData &&
                        tgData.goods &&
                        (!tgData.join_item ||
                          tgData.join_item.length === 0) && (
                          <div
                            className={styles["role-button"]}
                            onClick={() => goPay(0)}
                          >
                            单独开团￥{tgData.goods.charge}
                          </div>
                        )}
                    </>
                  )}
                  {!hideButton && (
                    <div className={styles["original"]}>
                      原价:￥{learn.original_charge}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {!isBuy && msData && <MiaoshaList msData={msData} />}
        {!isBuy && msData && (
          <div style={{ marginBottom: 30 }}>
            <TuangouList tgData={tgData} />
          </div>
        )}
      </div>
      <div className={styles["book-chapter-box"]}>
        {steps.length > 0 && (
          <div className={styles["steps-box"]}>
            {steps.map((item: any) => (
              <div key={item.id} className={styles["step-item"]}>
                <div className={styles["left-item"]}>
                  <img className={styles["icon"]} src={guideIcon} />
                  <div className={styles["column"]}></div>
                </div>
                <div className={styles["right-item"]}>
                  <div className={styles["step-title"]}>{item.name}</div>
                  <div className={styles["step-desc"]}>{item.desc}</div>
                  {item.courses.length > 0 && (
                    <div className={styles["courses-box"]}>
                      {item.courses.map((courseItem: any) => (
                        <div
                          key={courseItem.id}
                          className={styles["course-item"]}
                          onClick={() => goDetail(courseItem)}
                        >
                          <div className={styles["course-thumb"]}>
                            <div className={styles["spback"]}></div>
                            {courseItem.type === "book" ? (
                              <div className={styles["active-thumb-bar"]}>
                                <ThumbBar
                                  value={learn.thumb}
                                  width={75}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            ) : courseItem.type === "paper_paper" ||
                              courseItem.type === "paper_practice" ||
                              courseItem.type === "paper_mock_paper" ? (
                              <div className={styles["thumb-bar"]}>
                                <ThumbBar
                                  value={paperIcon}
                                  width={133}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            ) : (
                              <div className={styles["thumb-bar"]}>
                                <ThumbBar
                                  value={courseItem.thumb}
                                  width={133}
                                  height={100}
                                  border={4}
                                />
                              </div>
                            )}
                          </div>
                          <div className={styles["course-body"]}>
                            <div className={styles["course-name"]}>
                              {" "}
                              {courseItem.name}
                            </div>
                            <div className={styles["course-type"]}>
                              {courseItem.type_text}
                            </div>
                            {courseItem.charge === 0 && (
                              <div className={styles["course-free"]}>免费</div>
                            )}
                            {courseItem.charge !== 0 && (
                              <div className={styles["course-charge"]}>
                                原价:￥{courseItem.charge}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
