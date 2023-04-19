import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { Row, Col, Modal, Spin, Button, Pagination } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { wenda } from "../../api/index";
import {
  Empty,
  QaItem,
  FilterScenes,
  FilterCategories,
} from "../../components";

export const WendaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(16);
  const [total, setTotal] = useState(0);
  const [pcDiyContent, setPcDiyContent] = useState<any>("");
  const [visiable, setVisiable] = useState(false);
  const result = new URLSearchParams(useLocation().search);
  const [scene, setScene] = useState(result.get("scene") || "default");
  const [cid, setCid] = useState(Number(result.get("cid")) || 0);
  const [child, setChild] = useState(Number(result.get("child")) || 0);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
  const scenes = [
    {
      id: "default",
      name: "综合",
    },
    {
      id: "solved",
      name: "已解决",
    },
    {
      id: "unsolved",
      name: "未解决",
    },
    {
      id: "last_answer",
      name: "最新回答",
    },
  ];

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getList();
  }, [refresh, page, size]);

  const getList = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    let category_id = 0;
    if (child === 0) {
      category_id = cid;
    } else {
      category_id = child;
    }
    wenda
      .list({
        page: page,
        size: size,
        scene: scene,
        category_id: category_id,
      })
      .then((res: any) => {
        setCategories(res.data.categories);
        setList(res.data.data.data);
        setTotal(res.data.data.total);
        setLoading(false);
      });
  };

  const resetList = () => {
    setPage(1);
    setList([]);
    setRefresh(!refresh);
  };

  const getConfig = () => {
    wenda.config().then((res: any) => {
      setPcDiyContent(res.data.pc_diy_content);
    });
  };

  const goLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <FilterCategories
        categories={categories}
        defaultKey={cid}
        defaultChild={child}
        onSelected={(id: number, child: number) => {
          setCid(id);
          setChild(id);
          if (id === 0) {
            navigate("/wenda?scene=" + scene);
          } else {
            navigate(
              "/wenda?cid=" + cid + "&child=" + child + "&scene=" + scene
            );
          }
          resetList();
        }}
      />
      <FilterScenes
        scenes={scenes}
        defaultKey={"default"}
        onSelected={(id: string) => {
          setScene(id);
          if (cid === 0) {
            navigate("/wenda?scene=" + id);
          } else {
            navigate("/wenda?cid=" + cid + "&child=" + child + "&scene=" + id);
          }
          resetList();
        }}
      />
      <div className={styles["contanier"]}>
        <div className={styles["qa-box"]}>
          {loading && (
            <Row style={{ width: 1200 }}>
              <div className="float-left d-j-flex mt-50">
                <Spin size="large" />
              </div>
            </Row>
          )}
          {!loading && list.length === 0 && (
            <Col span={24}>
              <Empty></Empty>
            </Col>
          )}
          {!loading && list.length > 0 && (
            <div className={styles["list-box"]}>
              {list.map((item: any) => (
                <QaItem
                  key={item.id}
                  cid={item.id}
                  credit1={item.credit1}
                  statusText={item.status_text}
                  status={item.status}
                  title={item.title}
                  viewTimes={item.view_times}
                  answerCount={item.answer_count}
                  voteCount={item.vote_count}
                ></QaItem>
              ))}
            </div>
          )}
          {!loading && list.length > 0 && size < total && (
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
        <div className={styles["right-contanier"]}>
          <div className={styles["cont"]}>
            <Button
              className={styles["create-button"]}
              onClick={() => {
                if (!isLogin) {
                  goLogin();
                  return;
                }
                setVisiable(true);
              }}
            >
              我要提问
            </Button>
            {pcDiyContent && pcDiyContent !== "" && (
              <div
                className={styles["wenda-tips"]}
                dangerouslySetInnerHTML={{ __html: pcDiyContent }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
