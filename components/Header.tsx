import { useState, MouseEvent } from 'react';
import { Burger, Container, Group, Image, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';
import logo from '@/public/favicon.svg';

interface Link {
    link: string;
    label: string;
}

const links: Link[] = [
    { link: '/', label: '首页' },
    { link: '/oauth', label: '登录' },
    { link: 'https://klpbbs.com', label: '主站' },
    { link: '/about', label: '关于' },
];

export default function Header() {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState<string>(links[0].link);

    const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, link: string) => {
        event.preventDefault();
        setActive(link);
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const items = links.map((link) => (
        <a
          key={link.label}
          href={link.link}
          className={classes.link}
          data-active={active === link.link || undefined}
          onClick={(event) => handleLinkClick(event, link.link)}
        >
            {link.label}
        </a>
    ));

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
                <Group gap={5} visibleFrom="xs">
                    {items}
                </Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}
