/*
 *	$Id: par.h,v 1.3 2004/08/05 22:59:11 solyga Exp $
 */

#define	DEBUG
#undef	DEBUG


#include <stdio.h>
#include <errno.h>
#include <unistd.h>	/* getopt(), read(), ... */
#include <stdlib.h>	/* exit(), malloc() */
#include <sys/types.h>	/* open() */
#include <sys/stat.h>	/* open() */
#include <fcntl.h>	/* open() */
#include <string.h>	/* str*() */

#define	DEBUG_CHANNEL	stderr
#define	ERROR_CHANNEL	stderr
#define	HELP_CHANNEL	stdout
#define	VERSION_CHANNEL	stdout

#define	RETVAL_OK	0
#define	RETVAL_BUG	1
#define	RETVAL_ERROR	2

#define	ALLOW_EMPTY_ARCHIVES

#define ACTION_NONE	0
#define	ACTION_LIST	1
#define	ACTION_EXTRACT	2
#define	ACTION_CREATE	3

#define	PERMISSIONS	( S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH)
#define	DIR_PERMISSIONS	( S_IRWXU | S_IRWXG | S_IRWXO )
#define	MAX_FN_LEN	PAK_TOC_FN_LEN	/* 0x00 included */
#define MALLOC_SIZE	512

#define	PAK_MAGIC		"PACK"
#define	PAK_MAGIC_SIZE		PAK_OFFSET_SIZE		/* '\0' excluded */
#define	PAK_OFFSET_SIZE		0x04	/* == sizeof(off_t) or convers. fails */
#define	PAK_HDR_SIZE		(PAK_MAGIC_SIZE+2*PAK_OFFSET_SIZE)
#define	PAK_TOC_ENTRY_SIZE	0x40
#define	PAK_TOC_FN_LEN		0x38	/* number of filename bytes in toc */
#define	FILE_ACCESS_MODE(MODE)	((MODE&0x03)==O_RDONLY?"reading":((MODE&0x03)==O_WRONLY?"writing":"read-write"))
#define	CP_BUF_SIZE	1024	/* copy-buffer size */

#define	VERSION_NUMBER		"0.03.01"
#define	DATE_OF_LAST_MOD	"2004-08-06"
#define	MY_EMAIL_ADDRESS	"Steffen Solyga <solyga@absinth.net>"

#define	MAX(A,B)	((A)>(B)?(A):(B))
#define	MIN(A,B)	((A)<(B)?(A):(B))

struct pak_header {
  char  magic[PAK_MAGIC_SIZE+1];
  off_t toc_off;
  off_t toc_sze;
  off_t pak_sze;
};

struct pak_tocentry {
  char  f_nme[PAK_TOC_FN_LEN+1];        /* to be shure */
  off_t f_off;
  off_t f_sze;
};
