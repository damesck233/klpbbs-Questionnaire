import React, { useEffect, useState } from 'react';
import { Burger, Container, Group, Image, Text, Menu, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import classes from './Header.module.css';
import logo from '@/public/favicon.svg';
import { Cookie } from '@/components/cookie';

interface Link {
    link: string;
    label: string;
}

const links: Link[] = [
    { link: '/', label: '首页' },
    { link: 'https://klpbbs.com', label: '主站' },
    { link: '/about', label: '关于' },
];

export default function Header({ opened, toggle }: HeaderProps) {
    const router = useRouter();
    const [username, setUsername] = useState<string | undefined>(undefined);
    const [uid, setUid] = useState<string | undefined>(undefined);

    useEffect(() => {
        const status = Cookie.getCookie('status');
        if (status === 'ok') {
            const uid_ = Cookie.getCookie('uid');
            const username_ = decodeURIComponent(Cookie.getCookie('username') || '');
            setUid(uid_);
            setUsername(username_);
        } else {
            setUsername('null');
        }
    }, []);

    const handleClick = (link: string) => {
        if (link.startsWith('http')) {
            window.open(link, '_blank', 'noreferrer');
        } else {
            router.push(link);
        }
    };

    const handleLogout = () => {
        Cookie.clearCookie('uid');
        Cookie.clearCookie('username');
        Cookie.clearCookie('status');
        window.location.reload();
    };

    const items = username === undefined ? null : [
        ...(username ? [
            <Menu
              key="greeting"
              width={200}
              shadow="md"
              transitionProps={{
                    transition: 'rotate-right',
                    duration: 150,
                }}>
                <Menu.Target>
                    <Text
                      className={classes.link}
                      role="button"
                      tabIndex={0}
                      aria-label={`你好, ${username}`}
                      inherit
                    >
                        你好, {username}
                    </Text>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item>
                        用户名: {username}
                    </Menu.Item>
                    <Menu.Item>
                        UID: {uid}
                    </Menu.Item>
                    <Menu.Item
                      onClick={handleLogout}
                      style={{ color: 'red' }}
                      aria-label="Logout"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                    >
                        退出登录
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>,
        ] : [
            <Button
              key="login"
              className={classes.loginButton}
              onClick={() => handleClick('/oauth')}
              aria-label="Login"
            >
                登录
            </Button>,
        ]),
        ...links.map((link) => (
            <a
              key={link.label}
              className={classes.link}
              onClick={() => handleClick(link.link)}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(link.link)}
              role="button"
              tabIndex={0}
              aria-label={link.label}
            >
                {link.label}
            </a>
        )),
    ];

    return (
        <header
          className={classes.header}
          style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
            }}
        >
            <Container size="md" className={classes.inner}>
                <Group>
                    <Image src={logo.src} w={28} h={28} />
                    <Text>苦力怕论坛 | 问卷系统</Text>
                </Group>
                {username !== undefined && (
                    <Group gap={5} visibleFrom="xs">
                        {items}
                    </Group>
                )}
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}

export interface HeaderProps {
    opened: boolean;
    toggle: () => void;
}
