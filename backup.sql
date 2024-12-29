--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_cards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    username text,
    english_phrase text NOT NULL,
    translate text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    examples text DEFAULT ''::text,
    learned boolean DEFAULT false
);


ALTER TABLE public.user_cards OWNER TO postgres;

--
-- Name: bot_phrases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bot_phrases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bot_phrases_id_seq OWNER TO postgres;

--
-- Name: bot_phrases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bot_phrases_id_seq OWNED BY public.user_cards.id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    rand_card_time text,
    show_random_card boolean,
    user_id text NOT NULL,
    id integer NOT NULL,
    timezone text
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_settings_id_seq OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: user_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cards ALTER COLUMN id SET DEFAULT nextval('public.bot_phrases_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Data for Name: user_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_cards (id, user_id, username, english_phrase, translate, created_at, examples, learned) FROM stdin;
26	56464958	diffurchik	1	r	2024-12-02 22:01:18.57978		f
32	56464958	diffurchik	gh	gh	2024-12-06 17:31:39.251124	gh	f
34	56464958	diffurchik	gh	gh	2024-12-06 17:36:21.163087	gh	f
36	56464958	diffurchik	io	io	2024-12-06 17:45:36.091859	kl	f
38	56464958	diffurchik	balblal	blabalba	2024-12-14 12:01:37.424792		f
39	56464958	diffurchik	balblal	blabalba	2024-12-14 12:01:50.657238	dgdf	f
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (rand_card_time, show_random_card, user_id, id, timezone) FROM stdin;
09:00	t	56464958	1	\N
\.


--
-- Name: bot_phrases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bot_phrases_id_seq', 39, true);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 1, true);


--
-- Name: user_cards bot_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cards
    ADD CONSTRAINT bot_phrases_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pk PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

